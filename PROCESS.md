# PROCESS.md — Game Analytics Dashboard

## Tech Stack Choice

### Backend
- **NestJS 11** — Chosen because the role uses NestJS and the template (`iluvcoffee`) was already provided. NestJS's module system, decorators, and built-in DI made it fast to scaffold clean, structured code.
- **In-memory storage** (plain TypeScript array) — The spec explicitly said "no need for real database." Skipping TypeORM/PostgreSQL removed ~30 min of setup overhead.
- **class-validator + class-transformer** — Already in the template, great for DTO validation with minimal boilerplate.
- **uuid** — Simple, zero-config ID generation for in-memory records.
- **pnpm** — Already used by the template; faster installs than npm.

**Alternatives considered:**
- Express + JSON file storage — rejected in favor of NestJS to match the company stack and show familiarity with the framework.
- TypeORM with SQLite — rejected because the spec said in-memory is fine; adding a DB layer would've burned 30–45 min.

### Frontend
- **Vite + React 18 + TypeScript** — Vite's near-instant dev server and HMR make iteration very fast during a time-limited challenge.
- **TanStack Query v5** — Handles server state, caching, loading/error states with minimal code. Eliminates a lot of boilerplate that `useEffect + useState` would need.
- **Axios** — Simple, typed HTTP client; familiar API for calling the REST endpoints.
- **Tailwind CSS v3** — Utility-first CSS means no context-switching to write stylesheets; fast to get a clean, responsive layout.
- **Recharts** — Declarative React chart library; picked for the bonus chart visualization with minimal setup.
- **Vitest + Testing Library** — Vitest runs in the same Vite pipeline, so no separate Jest config is needed for the frontend.

**Alternatives considered:**
- SWR instead of TanStack Query — both are good, TanStack Query chosen because the mutation/invalidation API is more explicit.
- CSS Modules — rejected for Tailwind because speed of iteration matters more than strict encapsulation here.

---

## AI Tool Usage

**Primary tool:** Cursor (with Claude Sonnet) — used in multi-agent mode.

### How I used AI

Instead of running a single sequential AI session, I used **Cursor's multi-agent / parallel chat** approach:

- **Planning agent** — Given the case study PDF and the `iluvcoffee` NestJS template, it analyzed the codebase structure, understood the requirements, and produced a full build plan with a shared data contract, TDD order, and time budget.
- **Backend agent** — Given the plan, it worked autonomously on the `backend/` directory: stripped the template, wrote tests first, then implemented the analytics module.
- **Frontend agent** — Given the plan, it worked autonomously on the `frontend/` directory in parallel: scaffolded the Vite app, wrote component tests first, then implemented all components.

Both implementation agents ran simultaneously, which cut the sequential build time roughly in half.

### Example Prompts Used

**1. Initial planning prompt (to planning agent)**
```
@case-study.pdf
@iluvcoffee/
- Have to build this working functional app locally within 4 hours.
- Create a plan for me to spin up multiple agent processes to avoid waiting time.
- 2 separate agents will work simultaneously, 1 for frontend and 1 for backend. Finally integrate together.
- Spin up agents to write unit or e2e tests first. Then implement to make those tests pass.
- Make sure clean, reusable, and maintainable code.
- Goal is creating a working app within the time limit.
```

**2. Backend agent prompt**
```
You are working on the `backend/` directory of a Game Analytics Dashboard.

Context:
- Based on the iluvcoffee NestJS template (already copied to backend/)
- Must strip out TypeORM, PostgreSQL, auth modules — use in-memory array storage instead
- Node.js 22+, pnpm, TypeScript strict mode

Data contract:
interface AnalyticsEntry {
  id: string; gameId: string; gameName: string;
  playerId: string; event: string; value: number; timestamp: string;
}

Endpoints:
  GET  /analytics         (filters: gameId, event, playerId, startDate, endDate, limit, offset)
  POST /analytics         (body: omit id & timestamp)
  GET  /analytics/summary (same filters, returns total/averageValue/byEvent/byGame)

TDD order:
1. Write src/analytics/analytics.service.spec.ts first
2. Write test/analytics/analytics.e2e-spec.ts
3. Implement AnalyticsModule (entity, dto, service, controller)
4. Seed 20 demo entries on bootstrap
5. Enable CORS for http://localhost:5173 in main.ts
6. Run pnpm test && pnpm test:e2e — all must pass
```

**3. Frontend agent prompt**
```
You are working on the `frontend/` directory of a Game Analytics Dashboard.

Context:
- Scaffold with: pnpm create vite@latest frontend -- --template react-ts
- Install: axios @tanstack/react-query recharts tailwindcss
- Dev deps: vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom

API base URL: http://localhost:3000

Data contract:
interface AnalyticsEntry { id, gameId, gameName, playerId, event, value, timestamp }
interface AnalyticsSummary { total, averageValue, byEvent, byGame }

TDD order:
1. Write tests first for: AnalyticsTable, SummaryCards, AddEntryForm, FilterBar
2. Implement: src/types/analytics.ts, src/api/analytics.ts, src/hooks/useAnalytics.ts
3. Implement components: FilterBar, SummaryCards, AnalyticsTable, AddEntryForm, AnalyticsChart (bonus)
4. Compose in App.tsx with loading/error states
5. Run pnpm test — all must pass
```

**4. Debug prompt (backend filtering)**
```
The GET /analytics?startDate=2024-01-01&endDate=2024-12-31 filter is not working correctly.
The service compares timestamps as strings — fix it to parse both as Date objects before comparing.
Update the unit test to cover this case.
```

**5. Integration fix prompt**
```
Frontend is getting CORS errors when calling http://localhost:3000/analytics.
Check backend/src/main.ts — the CORS origin should be 'http://localhost:5173'.
Also check that the frontend Axios baseURL exactly matches the backend port.
```

**6. Prompt for summary cards**
```
The SummaryCards component receives a AnalyticsSummary object.
Render: total entries, average value (2 decimal places), and a breakdown of top 3 events by count.
Use Tailwind — 3 cards in a row on desktop, stack on mobile.
```

**7. Prompt for seeding data**
```
In backend/src/main.ts, after app.listen(), call a seed function that populates
the AnalyticsService with 20 realistic fake entries spread across 3 games
(game-1 "Space Shooter", game-2 "Racing Pro", game-3 "Puzzle Quest"),
5 event types, and 10 player IDs. Spread timestamps across the last 30 days.
```

**8. Prompt for Recharts bar chart**
```
Create a BarChart using Recharts that renders the byEvent data from AnalyticsSummary.
X-axis = event names, Y-axis = count. Use a ResponsiveContainer with width 100% height 300.
Keep it simple — no legend needed, just bars with tooltips.
```

**9. Prompt for filter bar debounce**
```
The FilterBar is triggering an API call on every keystroke.
Wrap the onFilter callback in a 300ms debounce using a simple useRef + setTimeout approach
(no extra library needed).
```

**10. E2E test fix prompt**
```
The e2e test for POST /analytics is failing with 400 Bad Request.
The dto requires all fields. Check that the test payload includes: gameId, gameName, playerId, event, value.
Update the test fixture to include all required fields.
```

### What Worked Well
- **Multi-agent parallelism** was the biggest win — both backend and frontend were built simultaneously, cutting total wall-clock time roughly in half.
- AI handled all **boilerplate scaffolding** instantly: NestJS module/controller/service stubs, DTO classes, React component shells, test file setup.
- **TDD prompting** worked well — asking the agent to write tests first forced it to clarify the API contract before writing implementation code.
- Tailwind class generation was fast and consistent — no CSS context-switching.

### What Didn't Work / How I Fixed It
- The first backend agent attempt kept TypeORM imports in stripped files, causing startup errors. Fixed with a focused prompt: "Remove all TypeORM imports and decorators from the entity file — this is pure in-memory storage."
- TanStack Query v5 has a breaking change from v4 (`cacheTime` → `gcTime`). AI initially generated v4 syntax. I caught it during `pnpm test`, prompted: "Update to TanStack Query v5 API — use `gcTime` not `cacheTime`, and `mutationFn` must be inside `useMutation({...})`."
- Recharts `ResponsiveContainer` inside a flex column needs an explicit height on the parent div, or it collapses to 0. AI didn't know this edge case — I fixed it manually.

### Time Saved Estimate
Without AI assistance, this project would take ~6–8 hours (writing all boilerplate, test setup, component scaffolding, API layer from scratch). With multi-agent AI assistance, total time was approximately **3.5 hours** — roughly **50–60% faster**.

---

## Development Workflow

### Step-by-step
1. **Read requirements + plan** — Gave the case study PDF and iluvcoffee template to a planning agent, got a full build plan with data contracts, TDD order, and parallel agent instructions.
2. **Spin up 2 agents in parallel** — Backend agent and frontend agent started simultaneously with their respective prompts.
3. **TDD** — Each agent wrote failing tests first, then implemented until tests passed.
4. **Integration** — Started both dev servers, checked network tab, fixed CORS and minor contract mismatches.
5. **Polish** — Added seed data, verified responsive layout, ran all tests.
6. **Documentation** — Wrote README.md and this file.

### Time Breakdown
| Phase | Time |
|-------|------|
| Planning + prompt setup | ~20 min |
| Backend (parallel) | ~70 min |
| Frontend (parallel) | ~70 min |
| Integration | ~25 min |
| Documentation | ~15 min |
| **Total** | **~3h 30min** |

---

## Technical Decisions

### In-memory storage over SQLite/JSON file
The spec explicitly allowed in-memory storage. A plain TypeScript array with a seed function is zero-config, zero-dependency, and instant. The trade-off is that data resets on server restart — acceptable for a demo.

### TanStack Query over raw useEffect
`useQuery` + `useMutation` handles loading, error, and stale states declaratively. Using raw `useEffect` would've required more manual state management and risked subtle bugs with race conditions during the time limit.

### Class-validator for DTOs
Already in the iluvcoffee template. One `@UsePipes(ValidationPipe)` decorator on the controller catches all bad payloads and returns proper 400 responses — no manual validation code needed.

### TDD approach
Writing tests first forced me to finalize the API contract (field names, types, endpoint paths) before implementation. This meant the frontend and backend agents could work in parallel with confidence that their outputs would integrate cleanly.

### Recharts for charts (bonus)
Chosen over Chart.js because Recharts is React-native (no canvas imperative API), and the component API is easier to prompt AI with. No `useEffect` needed to initialize a chart instance.

---

## Results & Limitations

### What Works Well
- All 3 API endpoints functional with filtering and aggregation
- Frontend table displays all analytics entries with responsive layout
- Summary cards show total, average value, and event breakdown
- Add Entry form validates required fields and submits to API
- Filter bar filters by gameId, event, date range with debounce
- Bar chart visualizes event distribution (bonus)
- Loading and error states handled in all data-fetching paths
- Unit tests and e2e tests pass for backend
- Component tests pass for frontend

### What Doesn't Work / Known Limitations
- Data is not persisted — in-memory resets on server restart (by design per spec)
- No real-time updates (polling or WebSocket not implemented within time limit)
- No pagination UI (API supports limit/offset but frontend loads all results)
- No authentication (not required per spec)
- Chart does not respond to filter changes (shows global summary only)
- No export feature

### What I'd Improve with More Time
- Add WebSocket polling for live updates
- Persist data to SQLite or a JSON file so restarts don't lose entries
- Add pagination controls to the table
- Make the chart filter-aware (recompute from filtered results)
- Add more filter options (by player, by value range)
- Deploy backend to Railway, frontend to Vercel with a live demo link
