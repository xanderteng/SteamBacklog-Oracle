# Spec Delta: ai-backlog-triage

## MODIFIED Requirements

### Requirement: Triage Backlog Games with AI
The system SHALL accept a triage request containing a player's mood, available session minutes, and optional recommendation limit, analyze the user's persisted backlogged games (including untouched and in-progress titles with completion telemetry), and return structured recommendations with match scores, contextual reasoning, and completion metrics.

#### Scenario: Successful backlog triage recommendation
- **WHEN** a client submits a valid POST request to `/api/v1/steam/backlog/{steamId}/triage` with player mood and available minutes for a user with backlogged games
- **THEN** the system generates and returns a 200 OK response containing a player persona summary and ranked game recommendations including app ID, title, playtime, match score (0-100), reasoning for playing now, estimated session duration, `estimatedClearMinutes`, `achievementsUnlocked`, `achievementsTotal`, `achievementPercentage`, and `completionStatus`.

#### Scenario: Respecting maximum recommendation count
- **WHEN** a client specifies `maxRecommendations` in the triage request
- **THEN** the system returns at most that number of recommended games in the response list.

#### Scenario: No backlogged games found for user
- **WHEN** a client requests triage for a user who has no persisted games with `isBacklog = true`
- **THEN** the system returns an error response conforming to RFC-7807 ProblemDetail indicating that backlog games must be synced before triage can be performed.

#### Scenario: Upstream AI model failure or timeout
- **WHEN** the external generative language API encounters an error, rate limit, or timeout
- **THEN** the system returns a 502 Bad Gateway response conforming to RFC-7807 ProblemDetail describing the upstream failure.

#### Scenario: Recommending in-progress vs untouched games based on session window
- **WHEN** candidate games in the user backlog include both untouched and in-progress titles
- **THEN** the system provides Gemini with playtime, remaining hours to clear, and achievement percentage, allowing the AI to recommend continuing an in-progress game or starting a fresh untouched title matching the requested mood and duration.
