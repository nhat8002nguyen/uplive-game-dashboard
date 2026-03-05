# PROCESS.md — Game Analytics Dashboard

## Tech Stack Choice

### Backend
- **NestJS 11** — Role uses NestJS and the `iluvcoffee` template was already provided.
- **In-memory storage** — Spec said no real database needed; skipped TypeORM/PostgreSQL to save setup time.
- **class-validator + class-transformer** — Already in the template, handles DTO validation cleanly.
- **uuid** — Zero-config ID generation for in-memory records.
- **pnpm** — Already used by the template.

### Frontend
- **Vite + React 18 + TypeScript** — Near-instant dev server and HMR for fast iteration.
- **TanStack Query v5** — Handles server state, caching, loading/error states with minimal boilerplate.
- **Axios** — Simple typed HTTP client.
- **Tailwind CSS v3** — Utility-first, no context-switching to stylesheets.
- **Recharts** — Declarative React chart library, easy to compose with minimal setup.
- **Vitest + Testing Library** — Runs in the same Vite pipeline, no separate Jest config needed.

---

## AI Tool Usage

**Tool:** Cursor (Claude Sonnet) — used in multi-agent / parallel mode.

### Approach

Rather than a single sequential AI session, I used Cursor's parallel agent feature:
- **Plan mode** to think through architecture and generate agent instructions upfront.
- **2 simultaneous agents** — one for `backend/`, one for `frontend/` — running at the same time to cut wall-clock time roughly in half.
- **Debug mode** when something didn't work, to trace root cause systematically.

---

## My Actual Prompts

### Phase 1 — Initial Planning (Plan Mode)

```
@case-study.pdf @iluvcoffee/
- Have to build this working functional app locally within 4 hours.
- Create plan docs for me to spin up multiple agent processes to avoid waiting
  time like single agent process, maybe 2-3.
- Follow the docs told and will expand more features later.
- Spin up agents to write unit or e2e tests first. Then implement to make those tests pass.
- 2 separate sub-agents will work simultaneously, 1 for frontend and 1 for backend.
  Finally will integrate together.
- Clean, Reusable, maintainable code.
- Goal is creating a working app within the time limit.
@iluvcoffee is a template nestjs that I want to apply for backend of this app.
```

### Phase 2 — Additional Features (Plan Mode)

```
Want to add additional 2 features:
- Real-time Updates: Use WebSocket or polling for live data refresh
- Export Feature: Export data to CSV or JSON
Will run in 2 separate agent processes, 1 for FE and 1 for BE. Create a plan.
```

### Phase 3 — Pagination (Plan Mode)

```
Is the current app including pagination for entries table?
If not, create a plan for me to spin up 2 agents.
```

### Phase 4 — Run & Test (Agent Mode)

```
@.cursor/plans/game_analytics_dashboard_febe941b.plan.md
2 Agents for frontend and backend are already completed.
Let's run the app locally so I can test it manually.
```

### Phase 5 — Dark Mode (Agent Mode)

```
Add Dark Mode Toggle: Basic theme switching. Make sure not break things.
```

### Phase 6 — Table Fixes (Agent Mode)

```
1. Help me display GAME ID column as well.
2. It calls API every typing, I want to add debouncing to reduce API calls
   when filtering entries.
```

### Phase 7 — Restart App (Agent Mode)

```
Restart app
```

### Phase 8 — Summary Fix (Agent Mode)

```
The summary section is currently calculated for the current page,
it should calculate for all pages available.
```

### Phase 9 — Debug Dark Mode (Debug Mode)

```
DarkMode toggle didn't work. Help me debug.
```

### Phase 10 — Deploy Scripts (Agent Mode)

```
@deploy is a template of working deploy scripts than can be run in EC2. I want to create a new deploy folder for this app @/Users/nhatnguyen/Workspaces/interview-test/uplive-interview based on the template, so I can run script on my ec2 instance.
```

---

## Development Workflow

1. **Read requirements + plan** — Fed the case study PDF and `iluvcoffee` template to a planning agent. Got a full build plan with data contracts, TDD order, and parallel agent instructions.
2. **Spin up 2 agents in parallel** — Backend agent and frontend agent ran simultaneously with their own plan slices.
3. **TDD** — Each agent wrote failing tests first, then implemented until tests passed.
4. **Integration** — Started both dev servers, checked network tab, fixed CORS and minor contract mismatches.
5. **Iterative features** — Added dark mode, game ID column, debouncing, pagination, and summary fix via focused follow-up prompts.
6. **Debug** — Used Cursor debug mode to trace dark mode toggle failure and fix it without guessing.

### Time Breakdown

| Phase | Time |
|-------|------|
| Planning + prompt setup | ~20 min |
| Backend (parallel) | ~70 min |
| Frontend (parallel) | ~70 min |
| Integration | ~25 min |
| Iterative features & fixes | ~35 min |
| **Total** | **~3h 40min** |

---

## Technical Decisions

### In-memory storage
Spec explicitly allowed it. Zero-config, zero-dependency. Trade-off: data resets on restart — acceptable for a demo.

### TanStack Query
Declarative loading/error/stale state management. Avoided manual `useEffect` state juggling which is error-prone under time pressure.

### TDD approach
Writing tests first locked in the API contract (field names, types, endpoint paths) before implementation. This let backend and frontend agents work in parallel without integration surprises.

### Debouncing without a library
Used a `useRef + setTimeout` pattern — no extra dependency, keeps bundle small, easy to understand.

### Summary across all pages
The original summary was scoped to the current page's data. Fixed by calling `/analytics/summary` with the active filters but no pagination params, so the summary always reflects the full filtered dataset.

---

## Results

### What Works
- All 3 API endpoints with filtering and aggregation
- Paginated entries table with game ID column
- Summary cards scoped to full filtered dataset (not just current page)
- Add Entry form with validation
- Filter bar with debounce
- Dark mode toggle
- Real-time polling for live data refresh
- CSV / JSON export
- Bar chart for event distribution (bonus)
- Unit and e2e tests pass for backend
- Component tests pass for frontend

### Known Limitations
- Data is not persisted — in-memory resets on server restart (by spec design)
- No authentication (not required per spec)
- Chart does not respond to filter changes (shows global summary)

### What I'd Improve with More Time
- Persist data to SQLite so restarts don't lose entries
- Make the chart filter-aware
- Add more filter options (by player, by value range)
- Deploy backend to Railway, frontend to Vercel with a live demo link
