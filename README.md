# uplive-game-dashboard

A mini dashboard for game analytics with real-time updates, filtering, and export functionality.

**Stack:** NestJS (backend) · React + Vite + TailwindCSS (frontend) · TypeScript throughout

---

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9 (`npm install -g pnpm`)

---

## Getting Started

### Backend

```bash
cd backend
pnpm install
pnpm start:dev
```

Server starts at **http://localhost:3000**  
Swagger UI available at **http://localhost:3000/docs**

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

App starts at **http://localhost:5173**

---

## API Endpoints

Base URL: `http://localhost:3000`

### `GET /analytics`

Fetch analytics entries with optional filtering and pagination.

| Query param | Type | Description |
|---|---|---|
| `gameId` | string | Filter by game ID |
| `event` | string | Filter by event type |
| `playerId` | string | Filter by player ID |
| `startDate` | ISO 8601 | Filter entries after this date |
| `endDate` | ISO 8601 | Filter entries before this date |
| `limit` | number | Max entries to return |
| `offset` | number | Number of entries to skip |

**Response**
```json
{
  "data": {
    "entries": [ { "id": "...", "gameId": "game-1", "gameName": "Dragon Quest", "playerId": "player-1", "event": "match_start", "value": 100, "timestamp": "2026-03-05T10:00:00.000Z" } ],
    "total": 1
  }
}
```

---

### `POST /analytics`

Create a new analytics entry.

**Request body**
```json
{
  "gameId": "game-1",
  "gameName": "Dragon Quest",
  "playerId": "player-1",
  "event": "match_start",
  "value": 100
}
```

Valid `event` values: `match_start` | `match_end` | `purchase` | `level_up` | `login`

**Response** — the created entry with `id` and `timestamp`.

---

### `GET /analytics/summary`

Return aggregated stats. Accepts the same filter query params as `GET /analytics` (except `limit`/`offset`).

**Response**
```json
{
  "data": {
    "total": 42,
    "averageValue": 73.5,
    "byEvent": { "match_start": 10, "purchase": 5 },
    "byGame": { "game-1": 20, "game-2": 22 }
  }
}
```

---

### `GET /analytics/export`

Download all (optionally filtered) entries as **CSV** or **JSON**.

| Query param | Type | Description |
|---|---|---|
| `format` | `csv` \| `json` | Output format (default: `json`) |
| + all filters | — | Same filters as `GET /analytics` |

---

### `GET /analytics/stream` (SSE)

Server-Sent Events stream — pushes each new entry as it is created in real time.

---

## Running Tests

```bash
# Backend unit tests
cd backend && pnpm test

# Backend e2e tests
cd backend && pnpm test:e2e

# Frontend tests
cd frontend && pnpm test
```

---

## Project Structure

```
uplive-interview/
├── backend/          # NestJS API (in-memory storage)
├── frontend/         # React + Vite + TailwindCSS dashboard
├── README.md
└── PROCESS.md        # Process documentation & AI usage
```

## Screenshots
<img width="1903" height="1005" alt="image" src="https://github.com/user-attachments/assets/e4f2c73b-ce58-4c67-b015-d5618799976d" />

<img width="1904" height="1007" alt="image" src="https://github.com/user-attachments/assets/33a06475-1324-4407-a349-b46ffa0902b8" />
