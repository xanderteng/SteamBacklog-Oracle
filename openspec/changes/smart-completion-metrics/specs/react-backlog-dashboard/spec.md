# Spec Delta: react-backlog-dashboard

## MODIFIED Requirements

### Requirement: Midimalist Collector Game Cards
The system SHALL display backlogged Steam games as warm, tactile stoneware cards featuring full-bleed Steam capsule artwork melting into the card body, editorial serif typography, embossed status pill badges, dynamic progress bars based on estimated clear time, and player achievement telemetry.

#### Scenario: Displaying backlog game details
- **WHEN** backlog games are loaded for a user
- **THEN** each game card displays full-bleed capsule artwork melting via gradient into a matte stoneware body, an editorial serif game title, an embossed pill badge ("Untouched" in warm terracotta vs "In Progress" in warm amber), a clean App ID indicator, an achievement progress pill when `achievementsTotal > 0` (e.g. `14 / 45 Achievements • 31%`), and a physical recessed progress trough displaying playtime progress relative to estimated clear time formatted in hours (e.g. `4.5h / 18h avg to beat`).

#### Scenario: Empty backlog presentation
- **WHEN** a user has no backlogged games
- **THEN** the system renders a warm, matte stoneware empty-state card encouraging the player to sync their library or verify their Steam account.

### Requirement: AI Backlog Oracle Triage Consultation
The system SHALL provide an interactive Collector's Atelier Oracle consultation panel allowing players to select mood presets or enter custom moods, adjust session duration, and receive tailored game recommendations styled as gilded collector dossiers with structured reasoning and dynamic completion metrics.

#### Scenario: Generating tailored game recommendations
- **WHEN** the user selects a mood, sets available minutes, and clicks the triage consultation action
- **THEN** the system posts the request to `/api/v1/steam/backlog/{steamId}/triage`, displays the synthesized player persona summary dossier, and renders recommendation showcase cards.

#### Scenario: Displaying recommendation card telemetry
- **WHEN** triage recommendations are received
- **THEN** each recommendation card renders an ornate match score emblem (0-100% Match), an estimated session badge, an editorial serif game title, dynamic completion progress (`playtimeForeverMinutes / estimatedClearMinutes`), an achievement progress indicator when `achievementsTotal > 0`, and a warm parchment-tinted callout block with a thick crimson/gold border for the "Why Play Now" narrative.

#### Scenario: Handling triage failure
- **WHEN** the triage request encounters an empty backlog (404) or upstream AI error (502)
- **THEN** the system displays the RFC-7807 error diagnostic alert without losing user form inputs.
