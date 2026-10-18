# Tasks

## 1. Project Scaffolding & Configuration

- [ ] 1.1 Scaffold Spring Boot 3.3+ project in `/backend` using Java 21 and Maven with dependencies (`spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-validation`, `postgresql`, `lombok`, `spring-boot-starter-test`), and verify by running `mvn clean compile` in `/backend`.
- [ ] 1.2 Configure `application.yml` with virtual threads (`spring.threads.virtual.enabled=true`), PostgreSQL datasource credentials matching `docker-compose.yml`, Hibernate DDL/snake_case naming strategies, and `steam.api.key: ${STEAM_API_KEY:dummy-dev-key}` fallback so tests run without environment variables, and verify with an `@SpringBootTest` context loading test.
- [ ] 1.3 Create `SteamApiProperties` configuration and register a configured `RestClient` bean in `RestClientConfig` with base URL and connection timeouts, verifying bean creation with a JUnit 5 unit test.

## 2. Steam API Client & DTO Layer

- [ ] 2.1 Implement Java 21 record classes for external Steam API responses (`SteamOwnedGamesResponse`, `SteamResponseContainer`, `SteamGameDto`) with Jackson annotations, and verify JSON parsing with JUnit 5 unit tests.
- [ ] 2.2 Implement `SteamApiClient` service using `RestClient` to call `IPlayerService/GetOwnedGames/v0001/` with required query parameters, converting error responses into typed exceptions, and verify behavior using Mockito unit tests simulating success and error responses.

## 3. Persistence & Data Model

- [ ] 3.1 Create `SteamGame` JPA entity adhering to invariants (`@Getter`, `@Setter`, `@NoArgsConstructor`, snake_case column mappings, no `@Data`) mapped to `steam_game` table with unique constraint on `(steam_id, app_id)` and index on `(steam_id, is_backlog)`, and verify entity definition with a unit test.
- [ ] 3.2 Create `SteamGameRepository` extending `JpaRepository<SteamGame, Long>` declaring query methods `findBySteamId(String steamId)`, `findBySteamIdAndIsBacklogTrue(String steamId)`, and `findBySteamIdAndAppId(String steamId, Long appId)`, and verify repository interface contracts.

## 4. Service Layer & Backlog Logic

- [ ] 4.1 Create Java 21 record classes for public API responses (`SteamGameResponse`, `SyncSummaryResponse`) and implement `SteamSyncService` sync logic that invokes `SteamApiClient`, batch-loads existing user games via `findBySteamId(steamId)` into a `Map<Long, SteamGame>` keyed by `appId` to avoid N+1 queries, calculates `isBacklog = (playtimeForeverMinutes < 120)`, upserts all entities in a single `saveAll()` batch, and returns `SyncSummaryResponse`.
- [ ] 4.2 Implement `SteamSyncService` backlog query method to retrieve all `SteamGameResponse` records for a given `steamId` where `isBacklog = true`.
- [ ] 4.3 Write unit tests using JUnit 5 and Mockito for all `SteamSyncService` methods covering initial sync, re-sync updates, backlog threshold boundary conditions (playtime < 120 vs >= 120), and error handling, verifying with `mvn test`.

## 5. REST API & Exception Handling

- [ ] 5.1 Implement `GlobalExceptionHandler` with `@RestControllerAdvice` to translate domain exceptions (such as Steam API failures, invalid Steam IDs, and resource not found) into RFC-7807 `ProblemDetail` payloads, and verify with unit tests.
- [ ] 5.2 Implement `SteamSyncController` with `POST /api/v1/steam/sync/{steamId}` and `GET /api/v1/steam/backlog/{steamId}`, delegating to `SteamSyncService`, and verify endpoint routing and status codes using `MockMvc` tests.
- [ ] 5.3 Run full verification suite using `mvn clean test` from `/backend` to ensure all tests pass and virtual threads / architectural invariants are satisfied.
