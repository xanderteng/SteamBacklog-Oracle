# Proposal: Smart Completion Metrics

## Why

Currently, SteamBacklog Oracle relies on a rigid, hardcoded 120-minute cutoff to classify backlog games: any game with over 2 hours of playtime is permanently flagged as "not backlog", even if the title requires 40 to 100 hours to complete (such as RPGs or expansive action titles). Conversely, games with zero or minimal playtime lack context on average time-to-beat or player progress.

Introducing smart completion metrics replaces the arbitrary 2-hour rule with dynamic evaluation combining Steam player achievements and HowLongToBeat (HLTB) average completion times. This allows players to accurately track and triage both untouched titles and in-progress games (> 2 hours) until they have legitimately beaten or completed them.

## What Changes

* **Dynamic Backlog Evaluation**: Replace the static 120-minute threshold. A game is classified as `COMPLETED` (`isBacklog = false`) only when 100% of achievements are unlocked or lifetime playtime meets/exceeds the game's estimated clear time. Otherwise, games remain in the backlog as either `UNTOUCHED` (0 minutes) or `IN_PROGRESS` (> 0 minutes).
* **Completion & Achievement Telemetry**: Persist and expose `estimatedClearMinutes`, `achievementsUnlocked`, `achievementsTotal`, `achievementPercentage`, and `completionStatus` on `SteamGame` entity, `SteamGameResponse`, and `GameRecommendationDto`.
* **Steam Achievement Fetching**: Query Steam's `ISteamUserStats/GetPlayerAchievements/v0001/` concurrently using Java 21 Virtual Threads during library sync for games with non-zero playtime, gracefully handling games without achievements or restricted profiles.
* **Completion Time Estimator Service**: Introduce a dedicated backend service to resolve Main Story average completion time (`estimatedClearMinutes`) via HowLongToBeat lookup with batch Gemini estimation and a safe 600-minute (10-hour) fallback, cached on the entity.
* **Progress-Aware AI Triage**: Update the Gemini prompt payload to feed playtime, remaining time to beat, achievement percentage, and completion status, enabling Gemini to suggest unfinished games tailored to available session windows.
* **Collector's Atelier Frontend Enhancements**:
  * Replace the 120-minute progress bar in `GameCard.tsx` and `RecommendationCard.tsx` with dynamic progress `(playtimeForeverMinutes / estimatedClearMinutes) * 100` displaying formatted hours (e.g., `4.5h / 18h avg to beat`).
  * Display an achievement progress pill badge when `achievementsTotal > 0` (e.g., `14 / 45 Achievements • 31%`).
  * Update TypeScript definitions in `src/types/steam.ts`.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `steam-library-sync`: Replace static 120-minute backlog threshold with dynamic completion evaluation based on player achievements and estimated clear minutes; add concurrent achievement fetching and estimated clear time resolution during sync.
- `ai-backlog-triage`: Enrich backlog triage candidate game payload and response records with completion status, achievement progress, and remaining clear time so Gemini can recommend unfinished in-progress games.
- `react-backlog-dashboard`: Update game card and recommendation card progress bars to reflect dynamic estimated clear time and display achievement badges.

## Impact

* **Backend Models & Database**: Extends `SteamGame` entity and PostgreSQL schema with 5 new fields (`estimated_clear_minutes`, `achievements_unlocked`, `achievements_total`, `achievement_percentage`, `completion_status`). Updates DTO records (`SteamGameResponse`, `GameRecommendationDto`).
* **External API Integration**: Adds Steam `ISteamUserStats/GetPlayerAchievements/v0001/` endpoint client method. Integrates HLTB / Gemini-backed duration estimation.
* **Concurrency**: Leverages Java 21 Virtual Thread executors (`Executors.newVirtualThreadPerTaskExecutor()`) for parallel achievement fetching across owned games.
* **Frontend**: TypeScript contracts updated; UI components render dynamic completion progress bars and achievement pills while preserving the existing Collector's Atelier styling.
* **Tests**: All backend unit/integration tests and frontend Vitest suites updated to assert new telemetry fields and calculation logic.
