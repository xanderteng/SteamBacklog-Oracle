# Design

## Context
See [proposal.md](file:///d:/SteamBacklog%20Oracle/openspec/changes/redesign-tactile-editorial-ui/proposal.md) for motivation. The frontend is built on Vite, React 18, TypeScript, and Tailwind CSS. The current interface renders a cyan/neon HUD with scanlines, geometric grids, corner brackets (`CornerBrackets.tsx`), and artificial sci-fi telemetry strings (`//`, `SYSTEM OPERATIONAL`, `V1.0.0`, `STEAM_ID_64`, `APP_ID //`). This design replaces that aesthetic with a warm, tactile Midimalist-Maximalist "Collector's Atelier" interface while preserving all existing TypeScript data contracts and API communication logic.

## Goals / Non-Goals

**Goals:**
- Implement the "Collector's Atelier" visual language: rich obsidian-espresso backgrounds, organic grain texture, deep crimson and bronze/amber lighting, warm stoneware cards, and ornamental dividers.
- Integrate Google Fonts editorial typography: `Playfair Display` (or `Fraunces`) for headings and game titles; `Plus Jakarta Sans` for body copy, metric cards, and interactive controls.
- Permanently remove all `//` separators, fake sci-fi status banners, `CornerBrackets.tsx`, neon cyan glow effects, and CSS scanline/grid overlays.
- Redesign `GameCard` and `RecommendationCard` into tactile collector artifacts with full-bleed Steam capsule artwork, embossed warm pill badges, physical recessed playtime progress bars, and warm parchment-tinted callouts.
- Update all component unit test suites in Vitest to pass cleanly against the new design system.

**Non-Goals:**
- Any modifications to backend services, database schemas, or Java DTOs.
- Altering the REST client logic in `steamOracleApi.ts` or modifying TypeScript models in `types/steam.ts`.
- Introducing heavy UI component libraries or external UI kits (relying solely on Tailwind CSS and clean custom SVG/CSS).

## Decisions

### 1. Typography Hierarchy and Google Fonts Integration
- **Decision**: In `index.html`, load `Playfair Display` (weights 600, 700) and `Plus Jakarta Sans` (weights 400, 500, 600, 700) via Google Fonts with `<link rel="preconnect">`. Configure them in `tailwind.config.js` under `fontFamily.display` and `fontFamily.sans`.
- **Rationale**: `Playfair Display` delivers an expressive, artisanal editorial presence for game titles and major section headers. `Plus Jakarta Sans` offers warm, humanist legibility for forms and metric values.
- **Alternatives Considered**:
  - `Cinzel` / `Cinzel Decorative`: Too aggressively fantasy-classical; clashes with modern game titles.
  - `Inter` / System Sans: Too clinical and sterile; fails the tactile, rich collector motif.

### 2. Atmospheric Grain and Organic Ambient Canvas (`AmbientCanvas.tsx` & `index.css`)
- **Decision**: Remove `.bg-grid-matrix`, `.bg-dot-matrix`, and `.bg-scanlines` from `index.css`. In `AmbientCanvas.tsx`, build a layered composition:
  - Base background: Deep obsidian-espresso gradient (`#11100f` to `#171412`).
  - Grain overlay: Inline SVG filter `<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>` with `<feColorMatrix type="saturate" values="0"/>`, rendered at `opacity: 0.035`.
  - Atmospheric lighting: Deep crimson (`#7f1d1d`/`#991b1b`), burnt bronze/amber (`#78350f`), and muted plum/slate radial blur spotlights.
  - Subtle organic corner accents using blurred SVG decorative forms.
- **Rationale**: An inline SVG turbulence grain eliminates external image assets while delivering an organic paper/stoneware texture across high-DPI displays.
- **Alternatives Considered**:
  - Base64 PNG grain image: Increases bundle size and causes repetition artifacts on 4K displays.
  - Pure CSS radial gradients without grain: Too flat and digital; lacks physical texture.

### 3. Tactile Stoneware Palette and Physical Surface Hierarchy
- **Decision**: Define a curated warm stoneware and atelier color palette in `tailwind.config.js`:
  - Surfaces: `stone-surface` (`#1c1917`), `stone-surface-raised` (`#24201d`), `stone-parchment` (`#29231e`).
  - Borders: `stone-border` (`#38312b`), `stone-border-subtle` (`#29231e`).
  - Accents: Warm crimson (`#991b1b`, `#7f1d1d`), terracotta/amber (`#c2410c`, `#b45309`, `#f59e0b`), warm gold/ochre (`#d97706`).
  - Physical shadow system: Multi-layer inset specular highlights (`shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07),0_16px_36px_-6px_rgba(0,0,0,0.75)]`).
- **Rationale**: Stoneware surfaces create a grounded, tangible environment reminiscent of physical board game boxes and archival collector binders.

### 4. Component Structure and Visual Purge
- **Decision**:
  - Delete `src/components/Common/CornerBrackets.tsx`.
  - In `CommandHeader.tsx`: Replace `STEAM_ID_64` prefix with a natural Title Case label ("Steam ID"), replace the flashing `SYSTEM OPERATIONAL // REST-AI ACTIVE` banner with an elegant Atelier status badge or decorative motif, remove `//` delimiters, and style the 3 `StatCard` modules as embossed stoneware plaques.
  - In `GameCard.tsx`: Render full-bleed Steam capsule image at the top with a smooth gradient melt into the matte card body, embossed warm pill badge (`Untouched` in terracotta vs `In Progress` in amber), editorial serif game title, and a physical recessed progress trough for playtime.
  - In `RecommendationCard.tsx`: Style as a gilded collector's dossier card with an ornate shield/circle match score emblem (`95% Match`), estimated session badge, and a warm dark parchment callout box (`#29231e` with thick left crimson/gold border) for "Why Play Now".
  - In `OraclePanel.tsx`: Replace sci-fi `GEMINI 2.5 FLASH` and `COGNITIVE STATE: READY` badges with an elegant editorial header and decorative divider.
- **Rationale**: Direct adherence to the user's explicit removal and replacement specifications.

### 5. Vitest Suite Harmonization
- **Decision**:
  - Update `CommonComponents.test.tsx`: Remove `CornerBrackets` test suite; verify `AmbientCanvas` and `ErrorBanner`.
  - Update `CommandHeader.test.tsx`: Remove checks for `SYSTEM OPERATIONAL` and `//`; assert editorial header branding and metric values.
  - Update `BacklogComponents.test.tsx`: Remove checks for `APP_ID` and `//`; verify game card title, status badge, and recessed progress bar.
  - Update `RecommendationCard.test.tsx`: Remove checks for `APP_ID //`; verify match score emblem, session badge, and "Why Play Now" callout.
  - Update `App.test.tsx`: Verify full integration flow with the new editorial labels.
- **Rationale**: Keeps the test suite comprehensive and green while reflecting the exact visual contract.

## Risks / Trade-offs

- **[Google Fonts network latency]** → Handled via `<link rel="preconnect">` to `fonts.googleapis.com` and `fonts.gstatic.com` with robust system serif/sans fallback declarations (`font-serif`, `font-sans`).
- **[SVG feTurbulence filter GPU rendering cost]** → Placed inside `AmbientCanvas` with `fixed inset-0 pointer-events-none` so it renders on a single composite layer without triggering layout thrashing during scrolls.
- **[Test assertions breaking on copy changes]** → Explicitly enumerated in tasks to update and verify each test suite before declaring completion.
