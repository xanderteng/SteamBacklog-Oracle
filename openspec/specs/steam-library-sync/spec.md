# steam-library-sync Specification

## Purpose
Enables synchronization of a user's owned games from the Steam Web API into the local database and provides retrieval of backlogged titles based on playtime thresholds.

## Requirements

### Requirement: Synchronize Owned Steam Games
The system SHALL accept a Steam ID and fetch the user's complete catalog of owned games from the external Steam Web API, persisting new game records and updating existing game records in the datastore with completion and achievement metrics.

#### Scenario: Successful initial synchronization
- **WHEN** a client issues a POST request to `/api/v1/steam/sync/{steamId}` for an existing and public Steam profile
- **THEN** the system fetches owned games from the Steam Web API, resolves estimated clear minutes, queries player achievements concurrently for games with non-zero playtime, stores or updates game records with completion telemetry (`estimatedClearMinutes`, `achievementsUnlocked`, `achievementsTotal`, `achievementPercentage`, `completionStatus`), and returns a 200 OK status with a summary of synced games.

#### Scenario: Re-syncing an existing user library updates records
- **WHEN** a client issues a POST request to `/api/v1/steam/sync/{steamId}` for a user whose games were previously synced
- **THEN** the system updates playtime, re-evaluates achievement progress and completion status, preserves cached `estimatedClearMinutes`, and avoids creating duplicate entries.

#### Scenario: Upstream Steam API failure handling
- **WHEN** a client requests a sync but the Steam Web API returns an error, times out, or indicates the profile is private/inaccessible
- **THEN** the system returns an appropriate error response conforming to RFC-7807 ProblemDetail and does not corrupt existing stored game records.

### Requirement: Evaluate Backlog Status
The system SHALL evaluate whether each owned game is classified as a backlog item based on game completion metrics rather than a static playtime cutoff. A game SHALL be marked as `COMPLETED` with `isBacklog = false` ONLY IF: (a) total achievements exceed zero and unlocked achievements equal total achievements (100% completion), OR (b) lifetime playtime is greater than or equal to `estimatedClearMinutes`. Otherwise, the game SHALL have `isBacklog = true`, with `completionStatus = UNTOUCHED` if playtime is 0 minutes, or `completionStatus = IN_PROGRESS` if playtime is greater than 0 minutes.

#### Scenario: Game with under 120 minutes playtime classified as backlog
- **WHEN** a game is synced with lifetime playtime of less than 120 minutes and has not met completion criteria
- **THEN** the system sets `isBacklog` to true and sets `completionStatus` to `UNTOUCHED` (if 0 minutes) or `IN_PROGRESS` (if > 0 minutes).

#### Scenario: Game with 120 minutes or more playtime classified as non-backlog
- **WHEN** a game is synced with lifetime playtime of 120 minutes or more that also meets completion criteria (100% achievements or playtime >= estimatedClearMinutes)
- **THEN** the system sets `isBacklog` to false and `completionStatus` to `COMPLETED`.

#### Scenario: Game transitions out of backlog upon playtime increase
- **WHEN** a previously in-progress backlog game is re-synced after lifetime playtime reaches or exceeds `estimatedClearMinutes` (or achievements reach 100%)
- **THEN** the system updates the game's record, sets `isBacklog` to false, and updates `completionStatus` to `COMPLETED`.

#### Scenario: Unfinished game with playtime under estimated clear time classified as in-progress backlog
- **WHEN** a game has playtime greater than 120 minutes but less than `estimatedClearMinutes`, and less than 100% achievements
- **THEN** the system sets `isBacklog` to true and `completionStatus` to `IN_PROGRESS`.

#### Scenario: Game with 100% achievements classified as completed
- **WHEN** a game has `achievementsTotal > 0` and `achievementsUnlocked == achievementsTotal`
- **THEN** the system sets `isBacklog` to false and `completionStatus` to `COMPLETED`.

### Requirement: Query User Backlog Games
The system SHALL provide an endpoint to retrieve all games currently marked as backlog items for a specified Steam ID, including detailed completion and achievement telemetry.

#### Scenario: Retrieve backlogged games list
- **WHEN** a client issues a GET request to `/api/v1/steam/backlog/{steamId}` for a user with backlogged games
- **THEN** the system returns a 200 OK status with a JSON array containing only games where `isBacklog` is true for that `steamId`, including `estimatedClearMinutes`, `achievementsUnlocked`, `achievementsTotal`, `achievementPercentage`, and `completionStatus`.

#### Scenario: User has no backlogged games
- **WHEN** a client issues a GET request to `/api/v1/steam/backlog/{steamId}` for a user who has no games with `isBacklog = true`
- **THEN** the system returns a 200 OK status with an empty JSON array.

#### Scenario: Invalid Steam ID format
- **WHEN** a client requests backlog or sync with an invalid Steam ID format
- **THEN** the system returns a 400 Bad Request error with RFC-7807 ProblemDetail describing the validation failure.
