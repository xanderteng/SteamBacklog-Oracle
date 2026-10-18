# Design

## Context

See `proposal.md` for background and motivation. This design specifies the technical architecture for the greenfield Spring Boot backend service situated in `/backend`, integrating with Valve's Steam Web API and persisting catalog data in PostgreSQL.

Constraints strictly adhere to the project's root `SKILL.md`:
- Java 21 with Spring Boot 3.3+.
- Virtual Threads enabled (`spring.threads.virtual.enabled=true`).
- Java 21 `record` classes for all DTOs and API responses.
- Clean 3-tier layering: `Controller -> Service -> Repository`.
- Spring Data JPA with PostgreSQL, snake_case column mappings, entities using `@Getter`, `@Setter`, `@NoArgsConstructor` (no `@Data`).
- `@RestControllerAdvice` handling exceptions with RFC-7807 `ProblemDetail`.
- JUnit 5 and Mockito unit tests for all service methods.

## Goals / Non-Goals

**Goals:**
- Provide a robust Spring Boot 3.3+ backend scaffold in `/backend` with standard Maven build configuration.
- Integrate with Steam Web API (`IPlayerService/GetOwnedGames`) to retrieve a user's owned games list with app details.
- Transform and persist games into a PostgreSQL `steam_game` table using Spring Data JPA.
- Mark games with `playtimeForeverMinutes < 120` as `isBacklog = true` and others as `false`.
- Support idempotent synchronization: re-syncing updates playtime, icon URL, and backlog status without creating duplicates.
- Expose REST endpoints:
  - `POST /api/v1/steam/sync/{steamId}`
  - `GET /api/v1/steam/backlog/{steamId}`
- Normalize errors via `@RestControllerAdvice` returning RFC-7807 `ProblemDetail`.
- Validate service and controller behavior through Mockito and JUnit 5 tests.

**Non-Goals:**
- Steam OpenID authentication or user session/token management (Steam ID is provided as an explicit path parameter).
- Community features, friend library comparisons, or multi-platform backlog syncing (e.g., GOG, Epic).
- Advanced automated sync scheduling or background cron polling (sync is initiated on-demand via REST endpoint).
- Frontend UI development (planning is scoped to the backend service).

## Decisions

### 1. HTTP Client: Spring 6 `RestClient` on Virtual Threads
- **Choice**: Use Spring Framework 6.1+'s modern `RestClient`.
- **Rationale**: `RestClient` provides a fluent, synchronous API that integrates seamlessly with Java 21 Virtual Threads (`spring.threads.virtual.enabled=true`). It avoids the reactive complexity of `WebClient` (Project Reactor) while offering a modern, testable alternative to legacy `RestTemplate`.
- **Alternatives Considered**:
  - `RestTemplate`: In maintenance mode; lacks modern fluent configuration.
  - `WebClient`: Requires `spring-boot-starter-webflux` and reactive paradigms which are unnecessary given Java 21 virtual threads.

### 2. Entity Primary Key & Unique Constraints
- **Choice**: Surrogate primary key `id` (`Long`, generated identity) with a composite unique constraint on `(steam_id, app_id)` and an index on `(steam_id, is_backlog)`.
- **Rationale**: A surrogate key works cleanly with standard Spring Data JPA repository semantics while ensuring database-enforced deduplication per user and per game. The composite index `(steam_id, is_backlog)` optimizes backlog queries for a specific user.
- **Alternatives Considered**:
  - Composite `@EmbeddedId`: Adds ceremony to entity definitions and repository query signatures without added utility for this schema.

### 3. Java 21 Records for DTOs and API Payloads
- **Choice**: Model all external Steam API payloads and internal REST responses as immutable Java 21 `record` types.
  - Steam API DTOs:
    - `SteamOwnedGamesResponse(SteamResponseContainer response)`
    - `SteamResponseContainer(int gameCount, List<SteamGameDto> games)`
    - `SteamGameDto(long appid, String name, int playtimeForever, String imgIconUrl)`
  - Application REST DTOs:
    - `SteamGameResponse(Long id, String steamId, Long appId, String name, Integer playtimeForeverMinutes, String imgIconUrl, Boolean isBacklog)`
    - `SyncSummaryResponse(String steamId, int totalImported, int totalUpdated, int backlogCount)`
- **Rationale**: Complies with root `SKILL.md` invariant 1, guaranteeing immutability, compact syntax, and built-in pattern matching capability.

### 4. Idempotent Synchronization & Backlog Calculation
- **Choice**: Sync logic fetches all existing records for `steamId` in a single query (`findBySteamId`) and maps them into a `Map<Long, SteamGame>` keyed by `appId`. For each incoming game, if `appId` exists in the map, it updates playtime, metadata, and recalculates `isBacklog = (playtimeForeverMinutes < 120)`. If new, it instantiates a `SteamGame` entity. All records are persisted in a single batch via `saveAll()`.
- **Rationale**: Eliminates N+1 SELECT queries when syncing large libraries (500+ games) while preserving entity lifecycle and update timestamps.
- **Alternatives Considered**:
  - Delete-then-reinsert: Inefficient, churns database sequences, and breaks potential future foreign key relationships.

### 5. Error Normalization via RFC-7807 `ProblemDetail`
- **Choice**: Implement a `@RestControllerAdvice` extending `ResponseEntityExceptionHandler` or returning `ProblemDetail` directly for:
  - Upstream Steam API failures / timeouts (502 Bad Gateway or 503 Service Unavailable).
  - Profile private or invalid Steam ID (400 Bad Request or 404 Not Found).
  - Unhandled server exceptions (500 Internal Server Error).
- **Rationale**: Strictly enforces root `SKILL.md` invariant 4.

## Data Model

```
+-------------------------------------------------------------+
|                         steam_game                          |
+-------------------------------------------------------------+
| id                       : BIGSERIAL PRIMARY KEY            |
| steam_id                 : VARCHAR(32) NOT NULL             |
| app_id                   : BIGINT NOT NULL                  |
| name                     : VARCHAR(512) NOT NULL            |
| playtime_forever_minutes : INTEGER NOT NULL DEFAULT 0       |
| img_icon_url             : VARCHAR(255)                     |
| is_backlog               : BOOLEAN NOT NULL DEFAULT TRUE    |
| created_at               : TIMESTAMP WITH TIME ZONE NOT NULL|
| updated_at               : TIMESTAMP WITH TIME ZONE NOT NULL|
+-------------------------------------------------------------+
Constraint: UNIQUE (steam_id, app_id)
Index: idx_steam_game_user_backlog (steam_id, is_backlog)
```

## Risks / Trade-offs

- **[Risk] Private Steam Profiles**: If a user's Steam privacy settings hide owned games, `GetOwnedGames` returns an empty list or error.
  - **Mitigation**: Detect empty response payload and return a descriptive `ProblemDetail` (RFC-7807) informing the client that the profile is either private or owns no games.
- **[Risk] Rate Limiting by Steam API**: Frequent sync requests could encounter Steam Web API rate limits.
  - **Mitigation**: Configure appropriate connect/read timeouts (e.g. 5 seconds) on `RestClient` and normalize upstream 429/5xx responses.
- **[Risk] Missing Steam API Key in Environment**: Application failing to start or failing at runtime without configuration.
  - **Mitigation**: Provide `@ConfigurationProperties` or `@Value("${steam.api.key}")` with explicit configuration validation and documentation in `application.yml`.
