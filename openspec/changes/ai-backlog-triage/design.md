# Design

## Context

See `proposal.md` for background and motivation. This design specifies the technical architecture for the AI-powered backlog triage service in `/backend`.

The implementation builds upon the existing `SteamGameRepository` and Spring Boot 3.3 / Java 21 architecture:
- Java 21 Virtual Threads enabled (`spring.threads.virtual.enabled=true`).
- Java 21 `record` classes for all public and internal DTOs.
- Clean 3-tier layering: `Controller -> Service -> Repository / Client`.
- Normalized RFC-7807 `ProblemDetail` via `@RestControllerAdvice`.
- Global CORS configuration supporting the Vite React frontend on `http://localhost:5173`.
- Unit tests using JUnit 5 and Mockito.

## Goals / Non-Goals

**Goals:**
- Integrate Google Gemini REST API (`gemini-2.5-flash`) using a Spring 6 `RestClient`.
- Provide typed Java 21 records for triage requests, recommendation outputs, and Gemini API payloads.
- Implement `AiTriageService` to query user backlog games, bound the prompt to at most 50 games, construct structured prompts, and parse JSON responses.
- Expose `POST /api/v1/steam/backlog/{steamId}/triage` validating input constraints (`mood`, `availableMinutes`).
- Handle edge cases gracefully: empty backlog throws `EmptyBacklogException` mapped to RFC-7807 `ProblemDetail`; Gemini timeouts or failures mapped to 502 Bad Gateway.
- Configure global WebMvc CORS mapping for `http://localhost:5173` across `/api/v1/**`.
- Verify behavior with JUnit 5 unit tests, Mockito mocks, and MockMvc controller tests.

**Non-Goals:**
- Maintaining conversational chat history or multi-turn sessions (triage is single-shot recommendation).
- Local fine-tuning or embeddings/vector databases (structured prompt engineering with candidate game lists is sufficient and predictable).
- Directly querying Steam store tags or external review scrapers during triage (model knowledge and game titles/playtime suffice for bounding latency).

## Decisions

### 1. HTTP Client: Spring 6 `RestClient` for Gemini API
- **Choice**: Implement `GeminiClient` utilizing Spring 6's synchronous `RestClient` operating on Java 21 virtual threads.
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}`.
- **Properties**: Configured via `gemini.api.base-url: https://generativelanguage.googleapis.com` and `gemini.api.key: ${GEMINI_API_KEY:dummy-dev-key}`.
- **Rationale**: Aligns with the project's existing client pattern in `SteamApiClient`, maintaining virtual thread efficiency without reactive complexity.
- **Alternatives Considered**:
  - Official Google Cloud Java SDK (`google-cloud-vertexai`): Heavy enterprise dependency requiring GCP service account credentials instead of lightweight developer API keys.

### 2. Structured JSON Generation via `responseMimeType`
- **Choice**: Set `generationConfig.responseMimeType: "application/json"` in the Gemini request and enforce JSON schema in prompt instructions.
- **Rationale**: Guarantees deterministic, machine-readable JSON without markdown code fences (```json ... ```) or conversational filler, simplifying deserialization directly into Java 21 records.
- **Alternatives Considered**:
  - Regex extraction from free-form text: Fragile and error-prone.

### 3. Java 21 Records for Triage and Gemini DTOs
- **Choice**:
  - `TriageRequest(@NotBlank String mood, @Min(5) int availableMinutes, Integer maxRecommendations)`
  - `GameRecommendationDto(Long appId, String name, int playtimeForeverMinutes, String imgIconUrl, int matchScore, String whyPlayNow, int estimatedSessionMinutes)`
  - `TriageResponse(String steamId, String playerPersonaSummary, List<GameRecommendationDto> recommendations)`
  - Gemini DTOs: `GeminiRequest(List<GeminiContent> contents, GeminiGenerationConfig generationConfig)`, `GeminiContent(List<GeminiPart> parts, String role)`, `GeminiPart(String text)`, `GeminiResponse(List<GeminiCandidate> candidates)`.
- **Rationale**: Enforces immutability and compliance with root `SKILL.md` invariant 1.

### 4. Candidate Game Bounding (Top 50 Limit)
- **Choice**: When querying `SteamGameRepository.findBySteamIdAndIsBacklogTrue(steamId)`, slice candidates to `Math.min(backlog.size(), 50)` items before serializing into the LLM prompt.
- **Rationale**: Steam backlogs can contain hundreds of games. Bounding candidates to 50 titles keeps token consumption under 2,000 tokens per call, preventing latency spikes and staying within API quotas.
- **Selection Strategy**: Retain games ordered by least playtime / recently synced.

### 5. Global CORS Configuration
- **Choice**: Add a `@Configuration` class `WebCorsConfig implements WebMvcConfigurer` registering CORS mapping for `/api/v1/**` with `allowedOrigins("http://localhost:5173")` and standard HTTP methods.
- **Rationale**: Decouples cross-origin policies from individual controller annotations, ensuring upcoming Vite React frontend calls work seamlessly across both sync and triage routes.

### 6. Error Normalization
- **Choice**:
  - `EmptyBacklogException` -> 404 Not Found (or 422 Unprocessable Entity) ProblemDetail ("User has no synced backlog games").
  - `GeminiApiException` -> 502 Bad Gateway ProblemDetail ("Upstream AI service error").
  - Validation failures (`MethodArgumentNotValidException`) -> 400 Bad Request ProblemDetail.

## Risks / Trade-offs

- **[Risk] Gemini API Key Missing or Quota Exceeded**: Unconfigured keys or rate limits.
  - **Mitigation**: Property fallback `dummy-dev-key` allows test suite to run without environment variables; `GeminiClient` catches 4xx/5xx responses and translates them into descriptive `GeminiApiException` (502).
- **[Risk] Hallucinated App IDs by LLM**: The model could invent a game not in the user's backlog.
  - **Mitigation**: Post-process recommendations by cross-referencing candidate game map; assign the actual `imgIconUrl` and metadata from the database entity to prevent broken images.
- **[Risk] Long LLM Latency**: External AI calls can take 1-3 seconds.
  - **Mitigation**: Running on Java 21 Virtual Threads ensures the web server does not block OS threads during outbound HTTP calls. Configure 15s read timeout on `RestClient`.
