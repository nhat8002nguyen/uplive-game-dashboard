---
name: Game Analytics Dashboard
overview: Build a Game Analytics Dashboard with a NestJS backend (in-memory storage, based on iluvcoffee template) and React/Vite frontend. Two agents work in parallel — one owns backend, one owns frontend — using TDD (tests written first, then implementation).
todos:
  - id: agent1-setup
    content: "Agent 1: Copy iluvcoffee to backend/, strip TypeORM/auth/DB, update package.json"
    status: pending
  - id: agent1-tests
    content: "Agent 1: Write analytics.service.spec.ts and analytics e2e tests first"
    status: pending
  - id: agent1-impl
    content: "Agent 1: Implement AnalyticsModule (entity, dto, service, controller), seed data, CORS"
    status: pending
  - id: agent2-setup
    content: "Agent 2: Scaffold frontend/ with Vite React TS + Tailwind + TanStack Query + Recharts + Vitest"
    status: pending
  - id: agent2-tests
    content: "Agent 2: Write component tests first (AnalyticsTable, SummaryCards, AddEntryForm, FilterBar)"
    status: pending
  - id: agent2-impl
    content: "Agent 2: Implement all components, API layer, hooks, App.tsx"
    status: pending
  - id: integration
    content: "Integration: Run both, verify data flow, fix any CORS/contract mismatches"
    status: pending
  - id: docs
    content: Write README.md and PROCESS.md
    status: pending
isProject: false
---

# Game Analytics Dashboard — Parallel Agent Build Plan

## Repository Layout

```
uplive-interview/
├── backend/          ← Agent 1 (NestJS, adapted from iluvcoffee/)
├── frontend/         ← Agent 2 (Vite + React + TypeScript)
├── README.md         ← written after both agents finish
└── PROCESS.md        ← written after both agents finish
```

---

## Shared Data Contract (API)

Both agents must agree on this before coding:

### `AnalyticsEntry`

```ts
{
  id: string;        // uuid v4
  gameId: string;
  gameName: string;
  playerId: string;
  event: string;     // 'match_start' | 'match_end' | 'purchase' | 'level_up' | 'login'
  value: number;     // score / duration / amount
  timestamp: string; // ISO 8601
}
```

### `AnalyticsSummary`

```ts
{
  total: number;
  averageValue: number;
  byEvent: Record<string, number>;   // event → count
  byGame: Record<string, number>;    // gameId → count
}
```

### Endpoints


| Method | Path                 | Query params                                                                    |
| ------ | -------------------- | ------------------------------------------------------------------------------- |
| GET    | `/analytics`         | `gameId?`, `event?`, `playerId?`, `startDate?`, `endDate?`, `limit?`, `offset?` |
| POST   | `/analytics`         | body: `Omit<AnalyticsEntry, 'id'                                                |
| GET    | `/analytics/summary` | same filters as GET                                                             |


Backend runs on **[http://localhost:3000](http://localhost:3000)**, CORS open for `http://localhost:5173`.

---

## Agent 1 — Backend

**Working directory:** `backend/`  
**Stack:** NestJS 11, pnpm, TypeScript, in-memory storage (plain array, NO TypeORM/DB)

### Setup steps

1. Copy `iluvcoffee/` to `backend/` then strip TypeORM, PostgreSQL, auth, CoffeeRating, Events, migrations modules — keep: project skeleton, `common/`, `config/`, test infra, `eslint.config.mjs`, `.prettierrc`
2. Remove `DB_`* env validation from `AppModule`, remove `TypeOrmModule`
3. Add `uuid` package

### TDD Order

**Write tests first:**

- `src/analytics/analytics.service.spec.ts` — unit tests covering:
  - `create()` assigns `id` and `timestamp`, appends to store
  - `findAll()` with no filters returns all entries
  - `findAll({ gameId })` filters correctly
  - `findAll({ event })` filters correctly
  - `findAll({ startDate, endDate })` filters by date range
  - `findAll({ limit, offset })` paginates
  - `getSummary()` computes `total`, `averageValue`, `byEvent`, `byGame`
- `test/analytics/analytics.e2e-spec.ts` — e2e tests:
  - `POST /analytics` 201 with valid body
  - `POST /analytics` 400 with missing required fields
  - `GET /analytics` 200 returns array
  - `GET /analytics?gameId=game-1` filters
  - `GET /analytics/summary` 200 returns summary shape

**Then implement:**

- `src/analytics/entities/analytics-entry.entity.ts` — plain TS class (no TypeORM decorators)
- `src/analytics/dto/create-analytics.dto.ts` — `class-validator` decorators: `@IsString()` on `gameId`, `gameName`, `playerId`, `event`; `@IsNumber()` on `value`
- `src/analytics/analytics.service.ts` — in-memory `entries: AnalyticsEntry[]`, methods `create`, `findAll`, `getSummary`
- `src/analytics/analytics.controller.ts` — three routes, apply `ValidationPipe`, Swagger tags
- `src/analytics/analytics.module.ts`
- Register in `AppModule`
- Set global `ValidationPipe` in `main.ts`, enable CORS for `http://localhost:5173`
- Seed 20 dummy entries on app bootstrap (for easy frontend demo)

### Key files to modify

- `[iluvcoffee/src/app.module.ts](iluvcoffee/src/app.module.ts)` → `backend/src/app.module.ts` (strip DB)
- `[iluvcoffee/src/main.ts](iluvcoffee/src/main.ts)` → `backend/src/main.ts` (add CORS, ValidationPipe)
- `[iluvcoffee/package.json](iluvcoffee/package.json)` → add `uuid`, remove postgres/passport/bcrypt deps

---

## Agent 2 — Frontend

**Working directory:** `frontend/`  
**Stack:** Vite, React 18, TypeScript, TanStack Query v5, Axios, Tailwind CSS v3

### Setup steps

1. `pnpm create vite@latest frontend -- --template react-ts`
2. `pnpm add axios @tanstack/react-query`
3. `pnpm add -D tailwindcss postcss autoprefixer && npx tailwindcss init -p`
4. `pnpm add recharts` (bonus chart)
5. `pnpm add -D @testing-library/react @testing-library/user-event @testing-library/jest-dom vitest jsdom`

### TDD Order

**Write tests first** (Vitest + Testing Library):

- `src/components/AnalyticsTable.test.tsx`
  - renders rows from `entries` prop
  - shows "No data" when empty
- `src/components/SummaryCards.test.tsx`
  - renders total, averageValue, event counts
- `src/components/AddEntryForm.test.tsx`
  - submits with correct payload on valid input
  - shows validation errors for empty required fields
- `src/components/FilterBar.test.tsx`
  - fires `onFilter` callback with updated params on input change

**Then implement:**

- `src/api/analytics.ts` — typed Axios functions: `fetchAnalytics(params)`, `createAnalytic(body)`, `fetchSummary(params)`
- `src/types/analytics.ts` — `AnalyticsEntry`, `AnalyticsSummary`, `FilterParams` interfaces (same contract as backend)
- `src/hooks/useAnalytics.ts` — TanStack Query `useQuery` + `useMutation` hooks
- `src/components/FilterBar.tsx` — inputs for `gameId`, `event`, `startDate`, `endDate`
- `src/components/SummaryCards.tsx` — stat cards: total, avg value, top event
- `src/components/AnalyticsTable.tsx` — sortable table with columns: game, player, event, value, timestamp
- `src/components/AddEntryForm.tsx` — controlled form with validation, calls `createAnalytic`
- `src/components/AnalyticsChart.tsx` — Recharts BarChart of `byEvent` from summary (bonus)
- `src/App.tsx` — composes all components, handles loading/error states

### CORS/API base

`src/api/analytics.ts` uses `axios.create({ baseURL: 'http://localhost:3000' })`.

---

## Integration Phase (after both agents complete)

1. Start backend: `cd backend && pnpm run start:dev`
2. Start frontend: `cd frontend && pnpm dev`
3. Verify: filter works, form submits, summary updates, chart renders
4. Write `README.md` and `PROCESS.md`

---

## Agent Execution Instructions

### Spawning Agent 1 (Backend)

Prompt Agent 1 with:

- Copy `iluvcoffee/` to `backend/`, strip TypeORM/auth, keep skeleton
- Write unit + e2e tests first (service spec + e2e spec)
- Implement `AnalyticsModule` with in-memory storage
- Seed 20 demo entries on boot
- Run `pnpm test` and `pnpm test:e2e` to confirm green

### Spawning Agent 2 (Frontend)

Prompt Agent 2 with:

- Scaffold Vite React TS in `frontend/`
- Install Tailwind, TanStack Query, Axios, Recharts, Vitest
- Write component tests first (Testing Library)
- Implement components + API layer
- Run `pnpm test` to confirm green
- `pnpm dev` must render dashboard at `http://localhost:5173`

---

## Time Budget (4h total)

- Setup + test writing: 45 min (both agents parallel)
- Implementation: 90 min (both agents parallel)
- Integration + debug: 30 min
- README + PROCESS.md: 15 min
- Buffer: 30 min

