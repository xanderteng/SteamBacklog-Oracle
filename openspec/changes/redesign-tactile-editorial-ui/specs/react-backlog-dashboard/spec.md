# Spec Delta

## MODIFIED Requirements

### Requirement: Command Deck Header and Library Synchronization
The system SHALL provide an editorial Collector's Atelier header allowing users to input a Steam ID, trigger library synchronization against the backend, and view synchronized library metrics without artificial sci-fi badges or double-slash delimiters.

#### Scenario: Successful library sync and telemetry update
- **WHEN** user submits a valid Steam ID and initiates library sync
- **THEN** the system sends a POST request to `/api/v1/steam/sync/{steamId}`, updates the stoneware metric stat cards (Total Imported, Updated, and Backlog Queue) in natural Title Case, and refreshes the backlog games list.

#### Scenario: Sync error display
- **WHEN** the sync request fails due to an invalid Steam ID or backend error
- **THEN** the system renders an RFC-7807 diagnostic error banner displaying the HTTP status code, title, and error detail message without corner bracket overlays.

### Requirement: Midimalist Collector Game Cards
The system SHALL display backlogged Steam games as warm, tactile stoneware cards featuring full-bleed Steam capsule artwork melting into the card body, editorial serif typography, embossed status pill badges, and physical recessed playtime progress bars.

#### Scenario: Displaying backlog game details
- **WHEN** backlog games are loaded for a user
- **THEN** each game card displays full-bleed capsule artwork melting via gradient into a matte stoneware body, an editorial serif game title, an embossed pill badge ("Untouched" in warm terracotta vs "In Progress" in warm amber), a clean App ID indicator without double slashes, and a physical recessed progress trough showing playtime out of 120 minutes.

#### Scenario: Empty backlog presentation
- **WHEN** a user has no backlogged games
- **THEN** the system renders a warm, matte stoneware empty-state card encouraging the player to sync their library or verify their Steam account.

### Requirement: AI Backlog Oracle Triage Consultation
The system SHALL provide an interactive Collector's Atelier Oracle consultation panel allowing players to select mood presets or enter custom moods, adjust session duration, and receive tailored game recommendations styled as gilded collector dossiers with structured reasoning.

#### Scenario: Generating tailored game recommendations
- **WHEN** the user selects a mood, sets available minutes, and clicks the triage consultation action
- **THEN** the system posts the request to `/api/v1/steam/backlog/{steamId}/triage`, displays the synthesized player persona summary dossier, and renders recommendation showcase cards.

#### Scenario: Displaying recommendation card telemetry
- **WHEN** triage recommendations are received
- **THEN** each recommendation card renders an ornate match score emblem (0-100% Match), an estimated session badge, an editorial serif game title, and a warm parchment-tinted callout block with a thick crimson/gold border for the "Why Play Now" narrative.

#### Scenario: Handling triage failure
- **WHEN** the triage request encounters an empty backlog (404) or upstream AI error (502)
- **THEN** the system displays the RFC-7807 error diagnostic alert without losing user form inputs.

### Requirement: Multi-Layered Ambient Canvas
The system SHALL render a persistent organic ambient visual canvas encompassing a deep warm obsidian-espresso base, an SVG fractal noise grain overlay, and warm crimson, burnt amber/bronze, and plum radial atmospheric lighting without scanlines or grid matrix overlays.

#### Scenario: Ambient canvas presentation
- **WHEN** the dashboard is loaded at any viewport resolution
- **THEN** the viewport displays the warm, tactile textured canvas with organic radial lighting and fractal noise grain without grid lines, dot matrices, scanlines, or glowing cyan wireframes.
