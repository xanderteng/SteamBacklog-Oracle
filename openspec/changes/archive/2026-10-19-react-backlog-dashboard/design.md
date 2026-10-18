# Design

## Context

See `proposal.md` for background and motivation. This design specifies the technical architecture for the rich, "Midimalist" React + TypeScript + Tailwind CSS frontend dashboard inside `/frontend`.

The Spring Boot 3.3 backend currently exposes three REST endpoints on `http://localhost:8080/api/v1/steam`:
- `POST /sync/{steamId}` returning `SyncSummaryResponse(steamId, totalImported, totalUpdated, backlogCount)`
- `GET /backlog/{steamId}` returning `List<SteamGameResponse(id, steamId, appId, name, playtimeForeverMinutes, imgIconUrl, isBacklog)>`
- `POST /backlog/{steamId}/triage` accepting `TriageRequest(mood, availableMinutes, maxRecommendations)` and returning `TriageResponse(steamId, playerPersonaSummary, recommendations)`
- Backend error responses conform to RFC-7807 `ProblemDetail` (e.g. 400 Bad Request, 404 Empty Backlog, 502 Gemini API Error).
- The backend's `WebCorsConfig` explicitly permits cross-origin requests from `http://localhost:5173` across `/api/v1/**`.

## Goals / Non-Goals

**Goals:**
- Deliver an expressive, tactile "Midimalist" (strictly non-minimalist) game-client HUD UI in `/frontend`.
- Establish a multi-layered ambient canvas: Obsidian `#0a0d14` base, CSS geometric grid/dot-matrix pattern, dual radial spotlights (amber/crimson and electric cyan/indigo), and subtle scanline texture.
- Construct ornate collector-style game cards (`GameCard` and `RecommendationCard`) with double/gradient borders, corner bracket accents, telemetry strips, playtime progress bars, and status badges.
- Construct `RecommendationCard` with radial match score emblems (0-100%), tactical briefing boxes ("Why Play Now"), and estimated session duration pill badges.
- Build a cockpit command console header with status LEDs, SteamID64 input group, gradient-beveled "INITIALIZE SYNC" button, and 3 framed telemetry stat modules (`TOTAL IMPORTED`, `UPDATED`, `BACKLOG QUEUE`).
- Build an interactive "Oracle Synthesis Module" panel with mood preset chips, custom mood text input, visual tick-mark time slider for `availableMinutes`, and persona summary dossiers.
- Implement a typed API client (`src/api/steamOracleApi.ts`) and strict TypeScript domain models matching backend Java 21 Records and RFC-7807 `ProblemDetail`.
- Provide unit tests using Vitest and React Testing Library (`npx vitest run`) and verify production compilation (`npm run build`).

**Non-Goals:**
- Steam OpenID / OAuth login flows (direct SteamID64 input matches the backend specification).
- Minimalist, flat, monochromatic UI (the aesthetic is strictly rich, ornate Midimalist).
- Persistent client-side database (backend PostgreSQL is the authoritative store).

## Decisions

### 1. Technology Stack: Vite + React 18 + TypeScript + Tailwind CSS + Lucide React
- **Choice**: Scaffold `/frontend` using Vite `react-ts` template, configured to run on port 5173. Use Tailwind CSS for utility styling augmented with custom design tokens, and Lucide React for iconography.
- **Rationale**: Vite provides sub-second HMR and instant TypeScript feedback. Tailwind CSS allows rapid composition of complex, layered HUD components without CSS sprawl.
- **Alternatives Considered**:
  - Next.js: Unnecessary server-side rendering complexity for a single-page game client dashboard.
  - Plain CSS / Styled Components: Higher boilerplate for responsive layout utilities and micro-interactions compared to Tailwind CSS with custom design tokens.

### 2. Midimalist Design System & Visual Invariants
- **Multi-Layered Ambient Canvas**:
  - Base: `#0a0d14` (Deep Obsidian / Midnight).
  - Background Layer 1: Geometric dot-matrix / grid SVG background pattern with low opacity.
  - Background Layer 2: Dual radial glow spotlights (`radial-gradient` at `top-left` with amber/crimson `#f59e0b`/`#ef4444` and `bottom-right` with cyan/indigo `#06b6d4`/`#6366f1`).
  - Background Layer 3: Scanline overlay (`repeating-linear-gradient` with subtle opacity) to evoke a physical terminal or gaming monitor display.
- **Collector Game Cards**:
  - Outer multi-layered frame with gradient borders (`from-cyan-500/30 to-indigo-500/30`) and metallic corner brackets (`+` accents).
  - Header telemetry strip displaying `APP_ID // #{appId}` and status badge (`UNTOUCHED` in neon amber/red if playtime is 0, `IN PROGRESS` in cyan/indigo if playtime > 0 and < 120 mins).
  - Steam capsule image using `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/{appId}/header.jpg` overlaid with an angled dark vignette gradient. On image load failure, an ornate fallback SVG card displays the game title.
  - Segmented playtime progress bar with tick segments representing progress towards the 120-minute backlog threshold.
  - Embossed footer displaying title and formatted playtime.
- **Recommendation Cards**:
  - Distinctive gilded / cyan neon border treatment.
  - Radial circular or hexagonal `matchScore` emblem (e.g., `95% MATCH`) with conic gradient accent.
  - Tactical briefing box ("Why Play Now") framed with left accent border and monospace styling.
  - Estimated session duration pill badge (`⏱ 45 MIN SESSION`).
- **Cockpit Command Deck Header**:
  - Command deck bezel with pulsing status LEDs (`SYSTEM OPERATIONAL // LINKED TO BACKEND`).
  - SteamID64 input group with monospaced label prefix `STEAM_ID_64`.
  - Gradient-beveled "INITIALIZE SYNC" button with hover glow and loading spinner.
  - 3 telemetry stat boxes (`TOTAL IMPORTED`, `UPDATED`, `BACKLOG QUEUE`) styled as physical digital instrumentation readouts.
- **Oracle Synthesis Module**:
  - Centerpiece panel with ornate beveled borders and glowing trim.
  - Mood preset chips: "Cozy & Low Energy", "High-Octane Action", "Deep Narrative RPG", "Short Coffee Break", "Strategic Mastery". Clicking a chip populates the input.
  - Custom mood text input for free-form expression.
  - Tactile range slider with visual tick marks (15, 30, 45, 60, 90, 120+ mins).
  - Persona summary dossier card displaying the AI's generated player profile.

### 3. Strict Domain Models and Typed API Client
- **Type Definitions** (`src/types/steam.ts`):
  ```typescript
  export interface SteamGameResponse {
    id: number;
    steamId: string;
    appId: number;
    name: string;
    playtimeForeverMinutes: number;
    imgIconUrl: string | null;
    isBacklog: boolean;
  }

  export interface SyncSummaryResponse {
    steamId: string;
    totalImported: number;
    totalUpdated: number;
    backlogCount: number;
  }

  export interface TriageRequest {
    mood: string;
    availableMinutes: number;
    maxRecommendations?: number;
  }

  export interface GameRecommendationDto {
    appId: number;
    name: string;
    playtimeForeverMinutes: number;
    imgIconUrl: string | null;
    matchScore: number;
    whyPlayNow: string;
    estimatedSessionMinutes: number;
  }

  export interface TriageResponse {
    steamId: string;
    playerPersonaSummary: string;
    recommendations: GameRecommendationDto[];
  }

  export interface ProblemDetail {
    type?: string;
    title: string;
    status: number;
    detail: string;
    instance?: string;
    timestamp?: string;
    errors?: string[];
  }
  ```
- **API Client** (`src/api/steamOracleApi.ts`):
  - Uses native `fetch` with `application/json` headers.
  - Handles HTTP error codes by parsing RFC-7807 `ProblemDetail` bodies.
  - Falls back to structured error objects on network disconnects or unparseable payloads.

### 4. Component Structure
```
frontend/
├── src/
│   ├── api/
│   │   └── steamOracleApi.ts
│   ├── components/
│   │   ├── Common/
│   │   │   ├── AmbientCanvas.tsx
│   │   │   ├── ErrorBanner.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── CornerBrackets.tsx
│   │   ├── Header/
│   │   │   └── CommandHeader.tsx
│   │   ├── Backlog/
│   │   │   ├── GameCard.tsx
│   │   │   └── BacklogGrid.tsx
│   │   └── Oracle/
│   │       ├── OraclePanel.tsx
│   │       ├── RecommendationCard.tsx
│   │       └── PersonaDossier.tsx
│   ├── types/
│   │   └── steam.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
```

## Risks / Trade-offs

- **[Risk] Missing or 404 Steam Capsule Artwork**: Obscure or delisted Steam games may not have capsule images on Akamai CDN.
  - **Mitigation**: Implement `onError` fallback on `<img />` that replaces the failed image with an ornate SVG canvas displaying the game title and an iconic game controller emblem.
- **[Risk] Large Steam Backlogs Causing Performance Slowdown**: Rendering hundreds of complex card elements simultaneously could degrade rendering performance.
  - **Mitigation**: Utilize CSS content-visibility, efficient grid layouts, and clean DOM trees without heavy animations when cards are out of view.
- **[Risk] CORS and Port Conflicts**: Vite dev server must run consistently on port 5173 to match backend CORS rules.
  - **Mitigation**: Set `server: { port: 5173, strictPort: true }` in `vite.config.ts`.
