# Proposal

## Why
The current frontend uses a neon sci-fi terminal motif with artificial telemetry tokens (`//`, fake status badges, glowing cyan wireframes, scanlines, and corner brackets) that detracts from the warm, tangible pleasure of managing a game collection. Overhauling the UI to a tactile Midimalist-Maximalist "Collector's Atelier" aesthetic provides a premium, warm editorial experience reminiscent of an artisanal collector's study and physical game catalog without disrupting existing backend integrations or TypeScript contracts.

## What Changes
- **Visual Removals**:
  - REMOVE all `//` double-slash separators across all headers, cards, badges, and footers.
  - REMOVE fake sci-fi badges and status strings: `V1.0.0`, `SYSTEM OPERATIONAL // REST-AI ACTIVE`, `GEMINI 2.5 FLASH`, `COGNITIVE STATE: READY`, `STEAM_ID_64` prefix, and `APP_ID //` prefixes.
  - DELETE `CornerBrackets.tsx` and strip all white corner bracket overlays across panels and cards.
  - REMOVE neon cyan, neon green, and glowing thin outlines.
  - REMOVE CSS grid/dot-matrix and scanline background overlays.
- **Collector's Atelier Design System**:
  - **Typography**: Introduce editorial serif fonts (`Playfair Display` / `Fraunces`) for headlines, section banners, and game titles; integrate warm humanist sans-serif (`Plus Jakarta Sans`) for controls and body copy; replace all-caps monospace labels with expressive Title Case typographic hierarchy.
  - **Atmospheric Textured Canvas (`AmbientCanvas.tsx` & `index.css`)**: Deep warm obsidian-espresso base (`#11100f` to `#171412`), SVG `feTurbulence` fractal noise grain, rich radial lighting in deep crimson (`#7f1d1d`/`#991b1b`), burnt amber/bronze (`#78350f`), and muted plum/slate, along with soft organic corner accents.
  - **Tactile Matte Surfaces & Ornate Framing**: Physical stoneware surfaces (`#1c1917` and `#24201d`) with multi-layered inset and drop shadows, warm stone/bronze borders (`#38312b`), subtle gold/crimson accent trims, and ornate horizontal divider rules with diamond/star motifs.
  - **Game Cards & Recommendation Cards**: Full-bleed Steam capsule art melting into matte stoneware bodies, embossed pill badges (`Untouched` in terracotta/crimson vs `In Progress` in warm amber/ochre), physical recessed progress troughs, gilded/crimson recommendation dossier cards with shield-style match score badges, and parchment-tinted dark callout blocks for "Why Play Now" recommendations.
- **Component Unit Tests**:
  - Update Vitest suites across `/frontend/src` to align with the refined copy and component hierarchy (retiring assertions checking for deleted sci-fi strings and `CornerBrackets`).

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `react-backlog-dashboard`: Redefines the visual presentation requirements, typography tokens, ambient canvas composition, collector game card aesthetics, and recommendation card dossier formatting from a neon sci-fi HUD into a warm, tactile Collector's Atelier interface.

## Impact
- **Frontend Code**: Modifies `index.html`, `tailwind.config.js`, `index.css`, `App.tsx`, and component files in `src/components/{Backlog, Common, Header, Oracle}`. Deletes `src/components/Common/CornerBrackets.tsx`.
- **API & Data Contracts**: Zero changes to `src/api/steamOracleApi.ts` and `src/types/steam.ts`; backend communication endpoints (`/sync/{steamId}`, `/backlog/{steamId}`, `/backlog/{steamId}/triage`) remain 100% compatible.
- **Dependencies**: No new npm packages required; typography loaded via Google Fonts CDN in `index.html`.
- **Tests**: Updates unit tests in `src/App.test.tsx` and `src/components/**/__tests__/*.test.tsx`.
