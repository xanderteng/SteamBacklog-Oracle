# Proposal

## Why

Steam users often amass extensive libraries of unplayed or barely played games without an automated way to identify and track their gaming backlog. Creating a dedicated backend service to ingest owned games from the Steam Web API and evaluate backlog status allows SteamBacklog Oracle to provide actionable backlog insights and recommendations.

## What Changes

- Scaffold a new Spring Boot 3.3+ backend project with Java 21, Spring Data JPA, and PostgreSQL dependencies in `/backend`.
- Create a Steam Web API client integration targeting `IPlayerService/GetOwnedGames` utilizing Java 21 records for strongly-typed DTOs.
- Create a `SteamGame` JPA entity and Spring Data repository mapping to PostgreSQL with composite/indexed identity (`steamId`, `appId`), game metadata, playtime, and an `isBacklog` flag (defaulting to true if playtime < 120 minutes).
- Implement a service layer with sync logic that fetches owned games, maps them, persists or updates game records, and evaluates backlog status.
- Expose REST API endpoints:
  - `POST /api/v1/steam/sync/{steamId}` to trigger library synchronization.
  - `GET /api/v1/steam/backlog/{steamId}` to retrieve backlogged games for a user.
- Configure global error handling with `@RestControllerAdvice` returning standard `ProblemDetail` (RFC-7807).
- Add comprehensive JUnit 5 and Mockito unit tests for service, controller, and client layers.

## Capabilities

### New Capabilities
- `steam-library-sync`: Syncing owned games from the Steam Web API, calculating backlog eligibility based on playtime thresholds, persisting game catalog state in PostgreSQL, and querying unplayed/backlog titles.

### Modified Capabilities
*(None - greenfield service initialization)*

## Impact

- **Backend Application**: Initializes new Spring Boot application under `/backend` with Maven wrapper, virtual threads enabled (`spring.threads.virtual.enabled=true`), and standard layered architecture (`Controller -> Service -> Repository`).
- **External Dependencies**: Integrates with external Valve Steam Web API (`https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/`), requiring a configurable `steam.api.key`.
- **Database**: Connects to the local PostgreSQL instance configured in `docker-compose.yml` (database `steambacklog`, port 5432) creating the `steam_game` table.
- **API Contracts**: Introduces `/api/v1/steam/sync/{steamId}` and `/api/v1/steam/backlog/{steamId}`.
