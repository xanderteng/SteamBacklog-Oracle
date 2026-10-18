# SteamBacklog Oracle

A personal full-stack learning project created to explore **Spring Boot 3 (Java 21)** and practice **Spec-Driven Development (SDD)** using **OpenSpec**.

The application connects to the Steam Web API to synchronize a user's game library, filters down to unplayed games in the backlog, and uses Google Gemini to recommend what game to play next based on available time and current mood.

---

## Project Motivation & Context

This repository is an exploratory sandbox focused on learning and practical experimentation rather than production use:
* **Spring Boot 3 & Modern Java:** Getting hands-on with Java 21 features (Records, pattern matching, Virtual Threads), Spring `RestClient`, JPA persistence, and RFC-7807 problem details.
* **Spec-Driven Development (SDD) with OpenSpec:** Building each capability iteratively by writing formal proposals, design specs, and verified task lists before implementation, tracking changes under [`openspec/`](./openspec).
* **AI & External API Integration:** Coordinating real-world external services (Steam Web API and Google Gemini Generative AI) with typed error handling and fallback resilience.

---

## Architecture & Tech Stack

### Backend (`/backend`)
* **Runtime & Framework:** Java 21, Spring Boot 3.3.4
* **Concurrency:** Project Loom Virtual Threads (`spring.threads.virtual.enabled=true`)
* **Persistence:** Spring Data JPA, PostgreSQL (via Docker Compose), H2 (in-memory for unit/integration tests)
* **HTTP Client:** Spring 6 `RestClient`
* **Validation & Error Handling:** Jakarta Bean Validation, `@RestControllerAdvice` returning RFC-7807 `ProblemDetail`
* **Testing:** JUnit 5, Mockito, Spring Boot Test (49 unit and integration tests)

### Frontend (`/frontend`)
* **Framework:** React 18 with TypeScript, Vite
* **Styling:** Tailwind CSS (tactile "Collector's Atelier" warm editorial theme)
* **Icons:** Lucide React
* **Testing:** Vitest, React Testing Library, jsdom (36 tests)

### Infrastructure & Tooling
* **Database:** PostgreSQL 16 via Docker Compose
* **SDD Tooling:** [OpenSpec](https://github.com/openspec) change specifications and archive logs

---

## Features

1. **Steam Library Synchronization:**
   * Ingests owned games from Steam Web API using a 64-bit Steam ID.
   * Upserts games into PostgreSQL and tracks overall count vs. unplayed backlog (`playtime_forever == 0`).

2. **Backlog Catalog Inspection:**
   * Browse unplayed games with real Steam header banners, total playtime, and search/sort capabilities.

3. **AI Backlog Triage:**
   * Accepts user mood prompts, available session minutes, and max recommendations.
   * Sends the unplayed catalog to Google Gemini (`gemini-3.8-flash`) to generate personalized recommendations with match scores and estimated completion sessions.

---

## Getting Started

### Prerequisites
* **Java 21** (JDK 21)
* **Node.js 18+** and **npm**
* **Docker & Docker Compose** (for PostgreSQL)
* Steam Web API key ([Steam Developer Portal](https://steamcommunity.com/dev/apikey))
* Google Gemini API key ([Google AI Studio](https://aistudio.google.com/))

---

### 1. Database Setup

Start the PostgreSQL container:

```bash
docker compose up -d
```

*(Configured in `docker-compose.yml` to bind host port `5435` to container port `5432`)*

---

### 2. Backend Setup

Set your API keys as environment variables and run Spring Boot:

**Windows (PowerShell):**
```powershell
$env:STEAM_API_KEY="your-steam-api-key"
$env:GEMINI_API_KEY="your-gemini-api-key"

cd backend
.\mvnw.cmd spring-boot:run
```

**macOS / Linux:**
```bash
export STEAM_API_KEY="your-steam-api-key"
export GEMINI_API_KEY="your-gemini-api-key"

cd backend
./mvnw spring-boot:run
```

The backend server runs on `http://localhost:8080`.

To run backend tests:
```bash
cd backend
./mvnw test
```

---

### 3. Frontend Setup

In a separate terminal, install dependencies and start the Vite dev server:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be accessible at `http://localhost:5173`.

To run frontend tests:
```bash
cd frontend
npm test
```

---

## Spec-Driven Development Workflow (OpenSpec)

All features in this project were designed and implemented through the OpenSpec workflow:

* `openspec/changes/archive/2026-10-18-steam-library-sync`: Steam API integration, DTO records, PostgreSQL persistence, and sync endpoints.
* `openspec/changes/archive/2026-10-19-ai-backlog-triage`: Gemini AI client, prompt engineering, structured triage response, and unit test suites.
* `openspec/changes/archive/2026-10-19-react-backlog-dashboard`: Vite + React + TypeScript setup, API client, and backlog dashboard.
* `openspec/changes/archive/2026-10-19-redesign-tactile-editorial-ui`: Visual overhaul to warm, tactile "Collector's Atelier" aesthetic with typography and responsive controls.
