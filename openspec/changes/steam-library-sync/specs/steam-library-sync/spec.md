# Spec Delta

## Purpose

Enables synchronization of a user's owned games from the Steam Web API into the local database and provides retrieval of backlogged titles based on playtime thresholds.

## ADDED Requirements

### Requirement: Synchronize Owned Steam Games
The system SHALL accept a Steam ID and fetch the user's complete catalog of owned games from the external Steam Web API, persisting new game records and updating existing game records in the datastore.

#### Scenario: Successful initial synchronization
- **WHEN** a client issues a POST request to `/api/v1/steam/sync/{steamId}` for an existing and public Steam profile
- **THEN** the system fetches owned games from the Steam Web API, stores or updates the app ID, name, playtime, icon URL, and backlog status for each game, and returns a 200 OK status with a summary of synced games.

#### Scenario: Re-syncing an existing user library updates records
- **WHEN** a client issues a POST request to `/api/v1/steam/sync/{steamId}` for a user whose games were previously synced
- **THEN** the system updates playtime and metadata for existing game records without creating duplicate entries.

#### Scenario: Upstream Steam API failure handling
- **WHEN** a client requests a sync but the Steam Web API returns an error, times out, or indicates the profile is private/inaccessible
- **THEN** the system returns an appropriate error response conforming to RFC-7807 ProblemDetail and does not corrupt existing stored game records.

### Requirement: Evaluate Backlog Status
The system SHALL evaluate whether each owned game is classified as a backlog item. A game SHALL be marked with an active backlog flag when its lifetime playtime is less than 120 minutes, and false when its playtime is 120 minutes or greater.

#### Scenario: Game with under 120 minutes playtime classified as backlog
- **WHEN** a game is synced with lifetime playtime of less than 120 minutes (e.g. 0 minutes or 45 minutes)
- **THEN** the system sets `isBacklog` to true for that game.

#### Scenario: Game with 120 minutes or more playtime classified as non-backlog
- **WHEN** a game is synced with lifetime playtime of 120 minutes or more
- **THEN** the system sets `isBacklog` to false for that game.

#### Scenario: Game transitions out of backlog upon playtime increase
- **WHEN** a previously synced game with `isBacklog = true` is re-synced with playtime updated to 120 minutes or more
- **THEN** the system updates the game's record and sets `isBacklog` to false.

### Requirement: Query User Backlog Games
The system SHALL provide an endpoint to retrieve all games currently marked as backlog items for a specified Steam ID.

#### Scenario: Retrieve backlogged games list
- **WHEN** a client issues a GET request to `/api/v1/steam/backlog/{steamId}` for a user with backlogged games
- **THEN** the system returns a 200 OK status with a JSON array containing only games where `isBacklog` is true for that `steamId`.

#### Scenario: User has no backlogged games
- **WHEN** a client issues a GET request to `/api/v1/steam/backlog/{steamId}` for a user who has no games with `isBacklog = true`
- **THEN** the system returns a 200 OK status with an empty JSON array.

#### Scenario: Invalid Steam ID format
- **WHEN** a client requests backlog or sync with an invalid Steam ID format
- **THEN** the system returns a 400 Bad Request error with RFC-7807 ProblemDetail describing the validation failure.
