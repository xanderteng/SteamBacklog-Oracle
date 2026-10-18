# Spec Delta

## Purpose

Provides AI-driven analysis of a user's unplayed Steam backlog games based on mood and available time constraints to return tailored recommendations with structured reasoning.

## ADDED Requirements

### Requirement: Triage Backlog Games with AI
The system SHALL accept a triage request containing a player's mood, available session minutes, and optional recommendation limit, analyze the user's persisted backlogged games, and return structured recommendations with match scores and contextual reasoning.

#### Scenario: Successful backlog triage recommendation
- **WHEN** a client submits a valid POST request to `/api/v1/steam/backlog/{steamId}/triage` with player mood and available minutes for a user with backlogged games
- **THEN** the system generates and returns a 200 OK response containing a player persona summary and ranked game recommendations including app ID, title, playtime, match score (0-100), reasoning for playing now, and estimated session duration.

#### Scenario: Respecting maximum recommendation count
- **WHEN** a client specifies `maxRecommendations` in the triage request
- **THEN** the system returns at most that number of recommended games in the response list.

#### Scenario: No backlogged games found for user
- **WHEN** a client requests triage for a user who has no persisted games with `isBacklog = true`
- **THEN** the system returns an error response conforming to RFC-7807 ProblemDetail indicating that backlog games must be synced before triage can be performed.

#### Scenario: Upstream AI model failure or timeout
- **WHEN** the external generative language API encounters an error, rate limit, or timeout
- **THEN** the system returns a 502 Bad Gateway response conforming to RFC-7807 ProblemDetail describing the upstream failure.

### Requirement: Bound AI Prompt Payload
The system SHALL restrict the number of candidate backlog games included in the prompt payload sent to the generative language model to a maximum of 50 titles to maintain predictable token consumption and low latency.

#### Scenario: Candidate games capped at 50 for large backlogs
- **WHEN** a user has more than 50 backlogged games in the datastore
- **THEN** the system selects at most 50 backlog games as context for the recommendation model.

#### Scenario: Small backlogs passed in full without truncation
- **WHEN** a user has 50 or fewer backlogged games
- **THEN** all of the user's backlog games are provided to the model.

### Requirement: Cross-Origin Resource Sharing for Web Clients
The system SHALL allow cross-origin HTTP requests originating from `http://localhost:5173` for all `/api/v1/**` endpoints.

#### Scenario: Preflight CORS request from local frontend
- **WHEN** a browser client issues an OPTIONS preflight request from origin `http://localhost:5173` to an `/api/v1/**` endpoint
- **THEN** the system responds with `Access-Control-Allow-Origin: http://localhost:5173` and allowed methods (GET, POST, OPTIONS).

#### Scenario: Cross-origin triage request allowed
- **WHEN** a client from `http://localhost:5173` issues a POST request to `/api/v1/steam/backlog/{steamId}/triage`
- **THEN** the system processes the request and includes appropriate CORS headers in the response.
