# Tasks

## 1. Gemini Configuration & LLM DTOs

- [ ] 1.1 Add `gemini.api.base-url: https://generativelanguage.googleapis.com` and `gemini.api.key: ${GEMINI_API_KEY:dummy-dev-key}` to `application.yml`, create `GeminiApiProperties` configuration class, and verify property binding with a JUnit 5 unit test.
- [ ] 1.2 Implement Java 21 record classes for Gemini API payloads (`GeminiGenerateRequest`, `GeminiContent`, `GeminiPart`, `GeminiGenerationConfig`, `GeminiGenerateResponse`, `GeminiCandidate`) with Jackson annotations, and verify JSON parsing with JUnit 5 unit tests.

## 2. Gemini Client Integration

- [ ] 2.1 Register a named `@Bean("geminiRestClient")` in `RestClientConfig` (and ensure the existing Steam `RestClient` is disambiguated via `@Qualifier` or `@Primary` to prevent `NoUniqueBeanDefinitionException`), and implement `GeminiClient` invoking `/v1beta/models/gemini-2.5-flash:generateContent?key={key}` with `responseMimeType: "application/json"` and error translation to `GeminiApiException`, verifying behavior using Mockito unit tests.

## 3. Backlog Triage DTOs & Service Layer

- [ ] 3.1 Implement Java 21 record classes for public triage API models: `TriageRequest(@NotBlank String mood, @Min(5) int availableMinutes, Integer maxRecommendations)`, `GameRecommendationDto(Long appId, String name, int playtimeForeverMinutes, String imgIconUrl, int matchScore, String whyPlayNow, int estimatedSessionMinutes)`, and `TriageResponse(String steamId, String playerPersonaSummary, List<GameRecommendationDto> recommendations)`.
- [ ] 3.2 Implement `AiTriageService` that queries `SteamGameRepository.findBySteamIdAndIsBacklogTrue(steamId)`, throws `EmptyBacklogException` if no backlog games exist, caps candidate games to top 50 to bound tokens, invokes `GeminiClient` with structured prompt instructions, cross-references returned recommendations against the candidate `Map<Long, SteamGame>` to filter out hallucinated `appId`s and enrich authoritative `imgIconUrl`/`playtimeForeverMinutes` metadata, respects `maxRecommendations`, and returns `TriageResponse`.
- [ ] 3.3 Write comprehensive unit tests using JUnit 5 and Mockito for `AiTriageService` covering successful triage, candidate game bounding to 50 items, empty backlog exception handling, and upstream error translation, verifying with `mvn test`.

## 4. REST Controller, Global CORS & Exception Handling

- [ ] 4.1 Implement `WebCorsConfig` implementing `WebMvcConfigurer` allowing origin `http://localhost:5173` across `/api/v1/**` with standard HTTP methods, and verify CORS preflight behavior with a MockMvc test.
- [ ] 4.2 Update `GlobalExceptionHandler` with handlers for `EmptyBacklogException` (mapping to 404 ProblemDetail), `GeminiApiException` (mapping to 502 ProblemDetail), and `MethodArgumentNotValidException` (mapping to 400 Bad Request ProblemDetail), and verify with unit tests.
- [ ] 4.3 Implement `POST /api/v1/steam/backlog/{steamId}/triage` in a dedicated `SteamTriageController` accepting `@Valid @RequestBody TriageRequest`, delegating to `AiTriageService`, and verify HTTP status codes and responses with MockMvc tests.
- [ ] 4.4 Run full verification suite using `mvn clean test` from `/backend` to verify all unit, integration, and architecture tests pass.
