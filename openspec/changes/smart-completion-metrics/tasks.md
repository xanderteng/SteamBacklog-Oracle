# Tasks: Smart Completion Metrics

## 1. Backend Domain Model & DTOs

- [ ] 1.1 Create `CompletionStatus` enum (`UNTOUCHED`, `IN_PROGRESS`, `COMPLETED`) and extend `SteamGame` entity with `estimatedClearMinutes` (nullable `Integer` by default so unestimated rows are detected), `achievementsUnlocked` (default `0`), `achievementsTotal` (default `0`), `achievementPercentage` (default `0.0`), and `completionStatus` (default `UNTOUCHED`), verifying database mapping and default values.
- [ ] 1.2 Update Java 21 records `SteamGameResponse` and `GameRecommendationDto` to include the five completion telemetry fields and update entity mapper methods.
- [ ] 1.3 Add domain model unit tests verifying DTO record immutability, JSON serialization, and entity default values.

## 2. External Steam Achievements & Completion Estimator Services

- [ ] 2.1 Add `getPlayerAchievements(String steamId, Long appId)` to `SteamApiClient` calling Steam's `ISteamUserStats/GetPlayerAchievements/v0001/`, gracefully catching 400/403/no-achievements errors and returning `PlayerAchievementsDto(0, 0, 0.0)`, verified by Mockito unit tests consistent with `SteamApiClientTest`.
- [ ] 2.2 Implement `CompletionTimeEstimator` service to resolve `estimatedClearMinutes` (Main Story average completion minutes) for games where `estimatedClearMinutes == null` (or `<= 0`): batch-estimate uncached game titles via `GeminiClient` in a single structured JSON call (or fast HLTB lookup with 2s timeout), persist the resolved minutes on the `SteamGame` entities so they are cached for future syncs, and fall back to `600` minutes if upstream estimation fails, verified by unit tests.

## 3. Library Sync Concurrency & Backlog Completion Engine

- [ ] 3.1 Refactor `SteamSyncService.syncLibrary` to fetch achievement stats concurrently for all games with `playtimeForeverMinutes > 0` using Java 21 Virtual Threads (`Executors.newVirtualThreadPerTaskExecutor()`) bounded by a `Semaphore(10)` to prevent Steam API 429 rate limiting, and resolve `estimatedClearMinutes` via `CompletionTimeEstimator` for any games missing an estimate.
- [ ] 3.2 Implement dynamic completion evaluation logic in `SteamSyncService` marking a game `COMPLETED` (`isBacklog = false`) ONLY IF (a) `achievementsTotal > 0 && achievementsUnlocked == achievementsTotal` OR (b) `playtimeForeverMinutes >= estimatedClearMinutes`; otherwise set `isBacklog = true` with status `UNTOUCHED` (if playtime == 0) or `IN_PROGRESS` (if playtime > 0).
- [ ] 3.3 Update `SteamSyncServiceTest` and `SteamSyncControllerTest` to assert virtual thread execution, achievement population, and dynamic completion state transitions.

## 4. AI Triage Prompt Enrichment

- [ ] 4.1 Update `AiTriageService` system prompt builder to pass each candidate game's `playtimeForeverMinutes`, `estimatedClearMinutes` (remaining hours to beat), and `achievementPercentage` to Gemini.
- [ ] 4.2 Map completion telemetry into returned `GameRecommendationDto` list and update `AiTriageServiceTest` with Mockito assertions.

## 5. Frontend TypeScript Contracts & UI Components

- [ ] 5.1 Update TypeScript contracts in `src/types/steam.ts` (`SteamGameResponse`, `GameRecommendationDto`, `CompletionStatus`) to match backend telemetry fields.
- [ ] 5.2 Update `GameCard.tsx` to replace the 120-minute progress bar with `(playtimeForeverMinutes / estimatedClearMinutes) * 100`, displaying formatted hours (e.g. `4.5h / 18h avg to beat`) and rendering an achievement pill badge when `achievementsTotal > 0`.
- [ ] 5.3 Update `RecommendationCard.tsx` to display dynamic completion progress and achievement indicator in the Collector's Atelier styling.
- [ ] 5.4 Update frontend Vitest unit test suites (`BacklogComponents.test.tsx`, `RecommendationCard.test.tsx`, `App.test.tsx`) to verify dynamic progress bar calculations and achievement badges, verifying with `npm test`.

## 6. Full Suite Verification

- [ ] 6.1 Run full backend test suite (`.\mvnw.cmd clean test`) and verify 0 failures across all unit and integration tests.
- [ ] 6.2 Run full frontend test suite (`npm run test`) and production build (`npm run build`) ensuring 0 lint, type, or test errors.
