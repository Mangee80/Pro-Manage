# Pro Manage: Project Story and Interview Narrative

## 1) Problem Statement
Most personal task boards answer "what tasks exist?" but fail to answer:
- Where work is getting stuck
- How long tasks stay stuck
- Whether delivery flow is improving week to week

That gap makes planning reactive. By the time a missed deadline is obvious, risk has already grown.

## 2) Why This App Should Exist
`Pro Manage` exists to combine execution and visibility in one loop:
- Execute work through a simple Kanban board (`Backlog -> Todo -> In Progress -> Done`)
- Track movement history per task
- Convert movement history into flow signals (aging WIP, cycle time, throughput, bottlenecks)

The purpose is not just storing tasks. The purpose is making delay risk visible early enough to act.

## 3) How Current Architecture Fulfills the Purpose

### Frontend
- `Login/Register` uses JWT-based auth and token refresh handling.
- `Dashboard` renders user-specific boards and cards by status.
- `Analytics` transforms card status history into a timeline (Gantt) and flow indicators.
- `Settings` allows profile/password updates.

### Backend
- `authRoutes` provides register/login/refresh/logout/profile flows.
- `cardRoutes` manages full card lifecycle:
  - create/edit/delete
  - status updates with `statusHistory` tracking
  - analytics counts for task health
- New `GET /api/card/flow-metrics` summarizes operational flow metrics:
  - `stuckCount`
  - `avgAgingWipDays`
  - `avgCycleTimeDays`
  - `throughput7d`
  - `stuckByStatus`

### Data Model Decisions
- Each card stores:
  - `createdAt`
  - `tag` (current status)
  - `statusHistory[]` (status + date transitions)
- This supports both board rendering and timeline analytics from a single source of truth.

## 4) What Was Missing and Why the Gantt Upgrade Matters
Before upgrade, the timeline was visually useful but less interview-friendly for explaining real-world decisions.

Now the Gantt section explicitly answers:
- What is happening now (current flow metrics)
- Where tasks are stuck (stuck count + by status)
- Why they are flagged (threshold-based bottleneck rule)
- What action to take (root-cause hint by dominant stuck status)

## 5) Interview Script Pack

### A) 30-Second Pitch
"I built Pro Manage to solve a practical gap in personal project boards: visibility of flow risk. The app tracks each task's status transitions and turns them into metrics like aging WIP, cycle time, and weekly throughput. The Gantt view is not just a chart; it highlights bottlenecks early so I can act before deadlines slip."

### B) 2-Minute Architecture Explanation
"The frontend is React with route-based pages for auth, dashboard, analytics, and settings. Backend is Express + MongoDB with JWT auth. Each task card has `tag` and `statusHistory` entries, so every status transition is persisted. Dashboard uses current status for Kanban views. Analytics uses status history to build timeline segments and compute flow metrics. I also added a `flow-metrics` API endpoint for interviewer-friendly, operational signals: stuck count, average aging WIP, average cycle time, throughput in last 7 days, and stuck-by-status distribution."

### C) 5-Minute Deep Dive (Data Flow + Tradeoffs)
1. User logs in, receives access/refresh tokens.
2. Dashboard fetches user cards and groups by current `tag`.
3. Any status change updates both current `tag` and appends to `statusHistory`.
4. Analytics flattens cards and computes timeline segments from `statusHistory`.
5. Flow metrics are derived from the same transitions:
   - Cycle Time = `createdAt -> done`
   - Aging WIP = days in current active status
   - Bottleneck = active status duration above threshold (7 days)
   - Throughput = count done in last 7 days
6. UI then maps metrics to action:
   - Metric strip for quick health scan
   - Sticky legend + definitions for interpretation clarity
   - Root-cause hint to identify where process is slowing

Tradeoff:
- I kept the upgrade balanced and backward-compatible. Existing routes still work, and frontend can fall back to local metric computation if `flow-metrics` fails.

## 6) Real-World Value Statement
This project now demonstrates:
- Product thinking (problem framing + user actionability)
- Systems thinking (single source of truth reused across board + analytics)
- Engineering pragmatism (incremental upgrade, no disruptive rewrite)
