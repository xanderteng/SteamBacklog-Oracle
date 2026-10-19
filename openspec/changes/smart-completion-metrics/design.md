# Design: Smart Completion Metrics

## Context

SteamBacklog Oracle currently synchronizes Steam games into PostgreSQL and marks any game with `playtimeForeverMinutes < 120` as `isBacklog = true`. While effective for identifying untouched demos or newly purchased games, it breaks down for titles with 3 to 50 hours of playtime that are actively in progress but nowhere near completion. Furthermore, the frontend hardcodes `playtimeForeverMinutes / 120` in its progress bar, and the AI triage service receives only raw playtime minutes without context on expected game length or achievement milestones.

See [`proposal.md`](./proposal.md) for background and motivation.

## Goals / Non-Goals

### Goals
* Extend `SteamGame` entity, PostgreSQL schema, and DTO contracts (`SteamGameResponse`, `GameRecommendationDto`) with completion metrics: `estimatedClearMinutes`, `achievementsUnlocked`, `achievementsTotal`, `achievementPercentage`, and `completionStatus`.
* Implement `getPlayerAchievements` in `SteamApiClient` with safe handling of 400 (no achievements) and 403 (restricted profile) responses.
* Introduce `CompletionTimeEstimator` service with entity-level caching and fallback resolution (HowLongToBeat / Gemini AI batch / 600-minute baseline).
* Refactor `SteamSyncService.syncLibrary` to fetch achievements concurrently using Java 21 Virtual Threads (`Executors.newVirtualThreadPerTaskExecutor()`) for played titles.
* Implement the new backlog rule: a game is marked `COMPLETED` (`isBacklog = false`) if 100% achievements are unlocked OR `playtime >= estimatedClearMinutes`; otherwise `isBacklog = true` with `UNTOUCHED` (0 mins) or `IN_PROGRESS` (> 0 mins).
* Enhance `AiTriageService` prompt to pass playtime, remaining clear time, and achievement percentage.
* Upgrade frontend components (`GameCard.tsx`, `RecommendationCard.tsx`, `steam.ts`) with dynamic completion progress bars and achievement pills while preserving the Collector's Atelier styling.

### Non-Goals
* Fetching individual achievement names, icons, or unlock timestamps (only aggregate counts and percentages are required).
* Modifying database records for games that are already completed if they are not in the user's sync payload.
* Creating external user accounts or third-party authentication beyond the public SteamID64 and existing API keys.

## Decisions

### 1. Data Model & Completion Status Representation
* **Enum**: Define `CompletionStatus` (`UNTOUCHED`, `IN_PROGRESS`, `COMPLETED`) mapped to string via `@Enumerated(EnumType.STRING)` on `SteamGame`.
* **Field Defaults on Entity**:
  * `estimatedClearMinutes`: `Integer`, default `null` on entity initialization (resolved by `CompletionTimeEstimator` during sync, with `600` minutes used as the fallback value if external estimation fails).
  * `achievementsUnlocked`: `Integer`, default `0`.
  * `achievementsTotal`: `Integer`, default `0`.
  * `achievementPercentage`: `Double`, default `0.0`.
  * `completionStatus`: `CompletionStatus`, default `UNTOUCHED`.
* **Database Migration**: Hibernate `ddl-auto: update` automatically adds the new columns with compatible types on restart.

### 2. Steam Player Achievements Client
* **Endpoint**: `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid={appId}&key={key}&steamid={steamId}`.
* **Response Handling**:
  * Steam returns HTTP 400 when an app has no achievements configured.
  * Steam returns HTTP 403 if player stats are private.
  * In `SteamApiClient.getPlayerAchievements(String steamId, Long appId)`, catch `HttpClientErrorException` and return `PlayerAchievementsDto(0, 0, 0.0)` rather than throwing exceptions or failing sync.
  * When HTTP 200 is returned, parse `playerstats.achievements`, counting items where `achieved == 1` vs total list size.

### 3. Completion Time Estimation Service (`CompletionTimeEstimator`)
* **Entity Cache**: If an existing game record has `estimatedClearMinutes != null && estimatedClearMinutes > 0`, reuse the persisted value.
* **Resolution Pipeline**:
  1. Primary: HowLongToBeat search API / endpoint lookup for the game title to extract Main Story average clear minutes.
  2. Secondary (Fallback): Batch prompt to Gemini API for uncached titles asking for estimated main story completion minutes in structured JSON.
  3. Tertiary (Default): 600 minutes (10 hours) standard default.

### 4. Concurrency with Java 21 Virtual Threads
* Sequential achievement HTTP calls for 50+ played games would introduce severe sync latency (15–30 seconds).
* Using Java 21 virtual threads:
  ```java
  try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
      var futures = playedGames.stream()
          .map(game -> executor.submit(() -> fetchAndPopulateAchievements(steamId, game)))
          .toList();
      for (var f : futures) { f.get(); }
  }
  ```
* Virtual threads allow concurrent non-blocking I/O across all played games, reducing library sync time to ~1-2 seconds.

### 5. Backlog Classification Engine
* Replaces the old `playtimeForeverMinutes < 120` logic in `SteamSyncService`:
  ```java
  boolean isCompleted = (totalAchievements > 0 && unlockedAchievements == totalAchievements)
      || (playtimeForeverMinutes >= estimatedClearMinutes);

  if (isCompleted) {
      game.setBacklog(false);
      game.setCompletionStatus(CompletionStatus.COMPLETED);
  } else if (playtimeForeverMinutes == 0) {
      game.setBacklog(true);
      game.setCompletionStatus(CompletionStatus.UNTOUCHED);
  } else {
      game.setBacklog(true);
      game.setCompletionStatus(CompletionStatus.IN_PROGRESS);
  }
  ```

### 6. AI Triage Prompt Enrichment
* In `AiTriageService.buildSystemPrompt`, each candidate game line is enriched:
  `"- AppID: 123 | Title: Game Title | Status: IN_PROGRESS | Playtime: 14.5h | Est Clear: 25.0h (10.5h remaining) | Achievements: 12/30 (40.0%)"`
* Gemini is instructed to recommend in-progress games when the user has enough time for a meaningful session, or untouched games when the player wants a fresh start.

### 7. Frontend Collector's Atelier UI Components
* **Progress Bar Calculation**:
  * `progressPercentage = Math.min(100, Math.round((playtimeForeverMinutes / estimatedClearMinutes) * 100))`
  * Subtitle text: `formatHours(playtimeForeverMinutes) + " / " + formatHours(estimatedClearMinutes) + " avg to beat"`
* **Achievement Pill**:
  * Rendered if `achievementsTotal > 0` in an embossed amber/gold pill:
    `<Trophy className="w-3 h-3 text-amber-500" /> 14 / 45 Achievements • 31%`
* **Card Badge**:
  * `UNTOUCHED`: Terracotta badge "Untouched"
  * `IN_PROGRESS`: Amber badge "In Progress"
  * `COMPLETED`: Gilded bronze badge "Completed"

## Risks / Trade-offs

* **[Steam Rate Limiting on Achievements]** → Mitigation: Only query achievements for games with `playtimeForeverMinutes > 0`. Untouched games (0 minutes) have 0 achievements by definition and skip the API call entirely.
* **[HLTB Availability or Network Variations]** → Mitigation: Resilience through multi-tier fallback (HLTB → Gemini Batch → 600m default) with entity-level persistence so each game title is estimated only once.
* **[Large Libraries with Hundreds of Played Games]** → Mitigation: Virtual thread executor handles lightweight concurrency; batch updates to PostgreSQL prevent connection pool exhaustion.
