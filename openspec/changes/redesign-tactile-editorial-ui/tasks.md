# Tasks

## 1. Typography and Design Tokens Setup

- [ ] 1.1 Load `Playfair Display` and `Plus Jakarta Sans` Google Fonts via preconnect links in `frontend/index.html` and verify font link tags are correctly formatted.
- [ ] 1.2 Update `frontend/tailwind.config.js` to configure the Collector's Atelier palette (`stone-surface`, `stone-surface-raised`, `stone-parchment`, `stone-border`, warm crimson, terracotta, gold/amber, and physical inset/drop shadows) and typography font families, verifying syntax and configuration with `npm run build`.
- [ ] 1.3 Update `frontend/src/index.css` by removing `.bg-grid-matrix`, `.bg-dot-matrix`, and `.bg-scanlines`, setting the default background to obsidian-espresso (`#11100f`), and styling warm tactile scrollbars, verifying clean compilation.

## 2. Atmospheric Ambient Canvas and Purge of Legacy Cyber-HUD Tokens

- [ ] 2.1 Refactor `frontend/src/components/Common/AmbientCanvas.tsx` to replace grid lines and scanlines with an inline SVG `feTurbulence` fractal noise grain overlay and warm crimson, burnt amber/bronze, and plum radial atmospheric lighting, verifying container rendering in `CommonComponents.test.tsx`.
- [ ] 2.2 Delete `frontend/src/components/Common/CornerBrackets.tsx` and remove all corner bracket imports and elements across all components (`CommandHeader`, `StatCard`, `ErrorBanner`, `GameCard`, `OraclePanel`, `PersonaDossier`, `RecommendationCard`, `BacklogGrid`), updating `CommonComponents.test.tsx` to remove CornerBrackets tests and verifying tests pass with `npx vitest run src/components/Common`.
- [ ] 2.3 Refactor `frontend/src/components/Common/StatCard.tsx` and `ErrorBanner.tsx` to use tactile matte stoneware surfaces, warm stone/bronze borders, and natural Title Case labels without neon cyan glow outlines, verifying with `npx vitest run src/components/Common`.

## 3. Collector's Atelier Header and Telemetry Purge

- [ ] 3.1 Refactor `frontend/src/components/Header/CommandHeader.tsx` to remove all `//` delimiters, delete `v1.0.0` badge, delete `SYSTEM OPERATIONAL // REST-AI ACTIVE` banner, remove `STEAM_ID_64` prefix in favor of clean Title Case "Steam ID", apply stoneware styling to the input and sync button, and verify component renders with `npx vitest run src/components/Header`.
- [ ] 3.2 Update `frontend/src/components/Header/__tests__/CommandHeader.test.tsx` to match the cleaned-up editorial copy, removing assertions for deleted sci-fi badges and delimiters, and verify all tests pass with `npx vitest run src/components/Header`.

## 4. Tactile Collector Game Cards & Backlog Archive

- [ ] 4.1 Refactor `frontend/src/components/Backlog/GameCard.tsx` with full-bleed Steam capsule artwork melting into the stoneware card body, editorial serif title (`Playfair Display`), embossed warm pill badge (`Untouched` in terracotta vs `In Progress` in warm amber), clean App ID indicator without double slashes, and a physical recessed progress trough, verifying rendering in `BacklogComponents.test.tsx`.
- [ ] 4.2 Refactor `frontend/src/components/Backlog/BacklogGrid.tsx` to adopt matte stoneware framing, warm stone search and filter chips, and an editorial empty state card without sci-fi badges, verifying with `npx vitest run src/components/Backlog`.
- [ ] 4.3 Update `frontend/src/components/Backlog/__tests__/BacklogComponents.test.tsx` to align test assertions with the new Title Case labels and clean App ID format, verifying all tests pass with `npx vitest run src/components/Backlog`.

## 5. Gilded Oracle Dossier & Recommendation Cards

- [ ] 5.1 Refactor `frontend/src/components/Oracle/RecommendationCard.tsx` as a gilded collector's dossier card with warm borders, shield/circular match score badge (`95% Match`), estimated session badge, editorial serif title, and dark parchment callout box for "Why Play Now", verifying with `npx vitest run src/components/Oracle/__tests__/RecommendationCard.test.tsx`.
- [ ] 5.2 Refactor `frontend/src/components/Oracle/OraclePanel.tsx` and `PersonaDossier.tsx` to remove `GEMINI 2.5 FLASH`, `COGNITIVE STATE: READY`, and `//` separators, applying warm stoneware cards and decorative divider rules, verifying with `npx vitest run src/components/Oracle`.
- [ ] 5.3 Update `frontend/src/components/Oracle/__tests__/OraclePanel.test.tsx` and `RecommendationCard.test.tsx` to match the refined copy, verifying all tests pass with `npx vitest run src/components/Oracle`.

## 6. End-to-End Integration and Build Verification

- [ ] 6.1 Update `frontend/src/App.tsx` and `App.test.tsx` to ensure root layout, footer copy (removing `//` and sci-fi tags), and integration tests match the Collector's Atelier design system, verifying with `npx vitest run src/App.test.tsx`.
- [ ] 6.2 Execute full frontend test suite (`npx vitest run`) and production build (`npm run build`) in `frontend`, verifying 100% test pass rate and clean bundle compilation.
