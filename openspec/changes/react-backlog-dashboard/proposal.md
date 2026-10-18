# Proposal

## Why

While the SteamBacklog Oracle backend provides high-performance Steam library synchronization and AI-driven backlog triage via Google Gemini, users currently have no visual client to interact with these capabilities. Players facing backlog choice paralysis need an immersive, tactile dashboard that turns library management into an engaging collector experience. A "Midimalist" (tactile, layered, expressive game-client HUD—strictly non-minimalist) frontend will provide rich telemetry, collector-style game cards, and an interactive Oracle consultation deck on `http://localhost:5173`.

## What Changes

- Scaffold a Vite + React 18 + TypeScript + Tailwind CSS + Lucide React project in `/frontend` configured to run on `http://localhost:5173`.
- Define strict TypeScript interfaces matching the backend's Java 21 Record DTOs (`SteamGameResponse`, `SyncSummaryResponse`, `TriageRequest`, `GameRecommendationDto`, `TriageResponse`, and RFC-7807 `ProblemDetail`).
- Implement a typed API client (`src/api/steamOracleApi.ts`) calling the Spring Boot backend (`http://localhost:8080/api/v1/steam`):
  - `POST /sync/{steamId}` for library import and update.
  - `GET /backlog/{steamId}` for retrieving unplayed backlog titles.
  - `POST /backlog/{steamId}/triage` for generating mood/time-tailored recommendations.
- Implement a Midimalist multi-layered ambient canvas with deep obsidian/midnight base (`#0a0d14`), geometric grid overlay, dual radial ambient glow spotlights (crimson/amber and electric indigo/cyan), and scanline texture overlay.
- Build collector-style game cards (`GameCard` and `RecommendationCard`) with double/gradient borders, corner bracket accents, telemetry strips (`APP_ID // #{appId}`), status badges (`UNTOUCHED` vs `IN PROGRESS`), Steam capsule header art with fallback graphics, angled vignette overlays, segmented playtime progress bars, and embossed footers.
- Build `RecommendationCard` with radial match score emblems (0-100%), tactical briefing boxes ("Why Play Now"), and estimated session duration pill badges.
- Build a cockpit command console header with decorative status LEDs, framed SteamID64 input group, gradient-beveled "INITIALIZE SYNC" action button, and 3 framed telemetry stat modules (`TOTAL IMPORTED`, `UPDATED`, `BACKLOG QUEUE`).
- Build an interactive "Oracle Synthesis Module" with mood preset chips, custom mood input, visual tick-mark time slider for available minutes, recommendation limits, and player persona summary dossiers.
- Implement a diagnostic RFC-7807 error banner displaying status codes, error titles, and details.
- Provide comprehensive unit tests with Vitest and React Testing Library (`npx vitest run`) and verify production bundle compilation (`npm run build`).

## Capabilities

### New Capabilities

- `react-backlog-dashboard`: Rich, tactile Midimalist web client interface providing Steam library sync management, unplayed backlog exploration, and AI-powered triage recommendations with real-time feedback.

### Modified Capabilities

*(None - backend REST API endpoints and contracts remain intact)*

## Impact

- **New Subdirectory**: Adds `/frontend` to the workspace containing the client build system, components, tests, and configuration.
- **Backend Integrations**: Consumes backend endpoints on `http://localhost:8080/api/v1/steam` (which already allows CORS from `http://localhost:5173`).
- **Dependencies**: Introduces Vite, React 18, React DOM, TypeScript, Tailwind CSS, PostCSS, Autoprefixer, Lucide React, Vitest, and React Testing Library in `/frontend`.
