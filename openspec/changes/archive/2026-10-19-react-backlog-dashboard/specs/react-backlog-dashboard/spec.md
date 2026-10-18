# Spec Delta

## Purpose

Provides a rich, tactile Midimalist web client interface for SteamBacklog Oracle that enables players to synchronize their Steam library, explore backlogged titles with collector-style cards, and consult the AI Oracle for tailored session recommendations.

## ADDED Requirements

### Requirement: Command Deck Header and Library Synchronization
The system SHALL provide a command deck header allowing users to input a SteamID64, trigger library synchronization against the backend, and view real-time telemetry metrics.

#### Scenario: Successful library sync and telemetry update
- **WHEN** user submits a valid SteamID64 and initiates library sync
- **THEN** the system sends a POST request to `/api/v1/steam/sync/{steamId}`, updates the sync telemetry metrics (TOTAL IMPORTED, UPDATED, and BACKLOG QUEUE), and refreshes the backlog games list.

#### Scenario: Sync error display
- **WHEN** the sync request fails due to an invalid Steam ID or backend error
- **THEN** the system renders an RFC-7807 diagnostic error banner displaying the HTTP status code, title, and error detail message.

### Requirement: Midimalist Collector Game Cards
The system SHALL display backlogged Steam games as multi-layered collector-style cards featuring framed art capsules, telemetry strips, playtime progress bars, and status indicators.

#### Scenario: Displaying backlog game details
- **WHEN** backlog games are loaded for a user
- **THEN** each game card displays a top telemetry strip with `APP_ID // #{appId}`, status badge (UNTOUCHED for 0 minutes playtime, IN PROGRESS for positive playtime under 120 minutes), Steam header artwork with fallback graphic, a segmented playtime progress bar relative to the 120-minute threshold, and playtime duration.

#### Scenario: Empty backlog presentation
- **WHEN** a user has no backlogged games
- **THEN** the system renders a prominent empty state prompt encouraging the player to sync their library or verify their Steam account.

### Requirement: AI Backlog Oracle Triage Consultation
The system SHALL provide an interactive Oracle consultation panel allowing players to select mood presets or enter custom moods, adjust session duration, and receive tailored game recommendations with structured reasoning.

#### Scenario: Generating tailored game recommendations
- **WHEN** the user selects a mood, sets available minutes, and clicks the triage consultation action
- **THEN** the system posts the request to `/api/v1/steam/backlog/{steamId}/triage`, displays the AI player persona summary dossier, and renders recommendation cards.

#### Scenario: Displaying recommendation card telemetry
- **WHEN** triage recommendations are received
- **THEN** each recommendation card renders a radial match score emblem (0-100%), a tactical briefing box with reasoning for playing now, and an estimated session duration badge.

#### Scenario: Handling triage failure
- **WHEN** the triage request encounters an empty backlog (404) or upstream AI error (502)
- **THEN** the system displays the RFC-7807 error diagnostic alert without losing user form inputs.

### Requirement: Multi-Layered Ambient Canvas
The system SHALL render a persistent multi-layered ambient visual canvas encompassing a deep obsidian base, a fixed geometric grid pattern, dual radial ambient glow spotlights, and a subtle scanline overlay.

#### Scenario: Ambient canvas presentation
- **WHEN** the dashboard is loaded at any viewport resolution
- **THEN** the viewport displays the layered background canvas with glowing radial spotlights and geometric matrix framing without obscuring interactive controls.
