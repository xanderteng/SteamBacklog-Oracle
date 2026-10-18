# Proposal

## Why

Having a large backlog of unplayed Steam games often leads to choice paralysis, where players struggle to decide which game fits their immediate mood and available session time. Providing an AI-driven triage recommendation service leverages generative models to analyze a user's catalog of unplayed games and produce contextual, reasoned recommendations.

## What Changes

- Add Google Gemini API integration using Spring 6 `RestClient` calling `gemini-2.5-flash` via `generativelanguage.googleapis.com` with configurable `gemini.api.key: ${GEMINI_API_KEY:dummy-dev-key}`.
- Define Java 21 `record` classes for triage requests, recommendation items, persona summaries, and Gemini API request/response payloads:
  - `TriageRequest(String mood, int availableMinutes, Integer maxRecommendations)`
  - `GameRecommendationDto(Long appId, String name, int playtimeForeverMinutes, String imgIconUrl, int matchScore, String whyPlayNow, int estimatedSessionMinutes)`
  - `TriageResponse(String steamId, String playerPersonaSummary, List<GameRecommendationDto> recommendations)`
- Implement `AiTriageService` to:
  - Query backlogged games for the given `steamId` using `SteamGameRepository.findBySteamIdAndIsBacklogTrue(steamId)`.
  - Throw a domain exception (`EmptyBacklogException` mapped to 404 or 422 ProblemDetail) when no backlog games exist for the user.
  - Limit candidate backlog games in the prompt to the top 50 games to ensure predictable token consumption and latency.
  - Query Gemini with structured prompt instructions enforcing strict JSON output conforming to `TriageResponse`.
- Expose REST endpoint `POST /api/v1/steam/backlog/{steamId}/triage` with validation on request inputs.
- Configure global CORS settings allowing `http://localhost:5173` (Vite React frontend) to invoke both library sync and backlog triage API endpoints.
- Update global error handling with `@RestControllerAdvice` to translate `EmptyBacklogException` and Gemini API failures into RFC-7807 `ProblemDetail`.
- Add JUnit 5 and Mockito unit tests for `GeminiClient`, `AiTriageService`, and `MockMvc` controller tests.

## Capabilities

### New Capabilities
- `ai-backlog-triage`: AI-powered backlog triage analyzing a player's backlogged Steam catalog against their mood and time constraints to generate ranked recommendations with match scores and qualitative rationales.

### Modified Capabilities
*(None - existing library sync and query specifications remain intact)*

## Impact

- **External Integrations**: Connects to Google Generative Language API (`https://generativelanguage.googleapis.com`) using model `gemini-2.5-flash`.
- **API Surface**: Adds endpoint `POST /api/v1/steam/backlog/{steamId}/triage`.
- **CORS Policy**: Configures WebMvc CORS mapping for origin `http://localhost:5173` across `/api/v1/**`.
- **Configuration**: Introduces `gemini.api.key` and `gemini.api.base-url` properties in `application.yml`.
