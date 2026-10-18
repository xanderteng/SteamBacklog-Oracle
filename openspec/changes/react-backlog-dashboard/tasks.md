# Tasks

## 1. Project Scaffolding & Design System Setup

- [ ] 1.1 Scaffold Vite + React 18 + TypeScript application inside `/frontend`, install `tailwindcss@^3.4.17`, `postcss`, `autoprefixer`, and `lucide-react`, and verify project files exist.
- [ ] 1.2 Configure Tailwind CSS v3 theme tokens (`#0a0d14` obsidian base, neon accents, fonts, gradient borders) in `tailwind.config.js` and `src/index.css` with ambient canvas utilities (dot-matrix grid, dual radial spotlights, scanline overlay), and verify CSS styles compile.
- [ ] 1.3 Setup `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, and `jsdom`, configuring `vite.config.ts` (importing `defineConfig` from `'vitest/config'` with `server: { port: 5173, strictPort: true }`), `src/test/setup.ts` (importing `'@testing-library/jest-dom/vitest'`), and TypeScript `types` in `tsconfig` so both `npx vitest run` and `npm run build` succeed without type errors.

## 2. Type Definitions & API Client

- [ ] 2.1 Define strict TypeScript interfaces in `src/types/steam.ts` matching backend Java 21 records (`SteamGameResponse`, `SyncSummaryResponse`, `TriageRequest`, `GameRecommendationDto`, `TriageResponse`, and RFC-7807 `ProblemDetail`), and verify with `npx tsc --noEmit`.
- [ ] 2.2 Implement typed API client `src/api/steamOracleApi.ts` calling backend endpoints (`syncLibrary`, `getBacklog`, `triageBacklog`) with RFC-7807 error decoding, and verify with unit tests in `src/api/__tests__/steamOracleApi.test.ts`.

## 3. Midimalist HUD & Collector Card Components

- [ ] 3.1 Implement `AmbientCanvas` multi-layered background, `CornerBrackets` metallic corner accent component, and diagnostic RFC-7807 `ErrorBanner` component with status badge, title, and error detail, and verify rendering with unit tests.
- [ ] 3.2 Implement `StatCard` and `CommandHeader` cockpit deck header with status LEDs, `STEAM_ID_64` input group, gradient-beveled sync button, and 3 framed telemetry stat modules (`TOTAL IMPORTED`, `UPDATED`, `BACKLOG QUEUE`), and verify interaction behavior with unit tests.
- [ ] 3.3 Implement `GameCard` collector-style card (with double border, `CornerBrackets`, `APP_ID // #{appId}` telemetry strip, `UNTOUCHED` vs `IN PROGRESS` status badge, Steam capsule artwork with SVG fallback graphic, angled vignette overlay, and 0-120 min segmented playtime bar) and `BacklogGrid` container (with empty state prompt), and verify with unit tests.
- [ ] 3.4 Implement `RecommendationCard` featuring radial `matchScore` emblem (0-100%), tactical briefing box ("Why Play Now"), and estimated session duration pill badge, and verify with unit tests.

## 4. Oracle Panel & Dashboard Integration

- [ ] 4.1 Implement `PersonaDossier` card and `OraclePanel` synthesis module featuring clickable mood preset chips, custom mood text input, visual tick-mark time slider for `availableMinutes`, and recommendation limit controls, and verify interaction behavior with unit tests.
- [ ] 4.2 Assemble dashboard in `App.tsx` connecting state to `steamOracleApi` for library sync, backlog exploration, and AI triage consultation, and verify user flows with component integration tests.
- [ ] 4.3 Run full test suite with `npx vitest run` and verify clean production build compilation with `npm run build`.
