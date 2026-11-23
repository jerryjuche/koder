# Admin AI insights — “Atlas”, the platform analyst

The admin dashboard has a conversational analyst. An admin asks questions in
plain language (“how was today?”, “who is slipping?”, “how is Aisha doing?”,
“which skills are weakest?”) and gets a written answer plus deterministic cards
computed from the database.

Two rules shape the whole feature:

1. **SQL owns the numbers. The model only narrates them.** The model never sees
   the database, never runs SQL and never receives raw rows. It gets one
   pre-aggregated snapshot and must cite only what is in it.
2. **The answer travels with its evidence.** Every assistant message stores the
   snapshot and structured report it was written from, so an admin can audit a
   claim later without rerunning the query.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/admin/ai/threads` | List the admin’s conversations |
| `POST` | `/admin/ai/threads` | Start a conversation (`{title?, period?}`) |
| `GET` | `/admin/ai/threads/{id}` | Thread + messages (owner-scoped) |
| `PATCH` | `/admin/ai/threads/{id}` | Rename / change period |
| `DELETE` | `/admin/ai/threads/{id}` | Soft-delete the conversation |
| `POST` | `/admin/ai/threads/{id}/messages` | Ask a question (SSE stream) |
| `POST` | `/admin/ai/insights` | Legacy one-shot question (kept for scripts) |

All of them sit behind `AdminOnly` and the shared AI rate limiter (15/min, no
bypass). The message endpoint is capped at 64 KB.

### Streaming protocol

`POST /admin/ai/threads/{id}/messages` answers with
`text/event-stream`. Frames are discriminated by key:

```
data: {"delta":"## Today\n\n**18 of 42** attempts passed…"}
data: {"thread_id":"…","message_id":"…","report":{…},"snapshot":{…},"subject":{…},"cached":false,"model":"…","generated_at":"…"}
data: [DONE]
data: {"error":{"code":"ADMIN_INSIGHTS_FAILED","message":"…"}}
```

The delta is the real narrative streamed from the provider, extracted from the
partially received JSON by `internal/enricher/insights_stream.go`. The extractor
decodes JSON escapes and withholds an escape that straddles a chunk boundary,
so the UI never shows garbage. Servers without `http.Flusher`, and cached
first turns, return ordinary JSON instead.

## Grounding: what the model receives

`store.GetInsightsSnapshot` builds the snapshot for a half-open UTC window
(`today`, `yesterday`, `week`, `month`, `all`):

- `totals` — active students, new accounts, submissions, passes, pass rate,
  distinct solves, XP from first-time solves, average passing runtime
- `comparison` — the preceding window of the same length plus deltas (nil for
  `all`)
- `lifetime` — students, engaged students, visible problems, total solves,
  students active in the last 7 days
- `daily_activity` — submissions/passes/active users per UTC day
- `top_performers` — window XP, lifetime XP, level, solves, attempts, pass rate,
  runtime, current streak
- `leaderboard` — top 10 by lifetime XP with level, window XP, top-10 movement
  and streak
- `levels` — student count per level band (1 000 XP per level)
- `at_risk` — engaged students quiet for more than 7 days, and students with
  three or more failed attempts on one problem without a pass
- `skills` + `weak_skills` — practice by problem tag, and tags with volume but
  under 55% passing
- `modules`, `difficulty`, `struggling_problems`
- `curriculum` + `funnel` — lesson completions/learners/XP, courses started vs
  completed (lesson rows only record completion, so drop-off is reported at
  course level and the UI says so)
- `community`, `ai` usage, and `activity_feed` (last 10 platform events)

When the question names a student, the handler also sends one **student
profile**: lifetime XP, level, rank, streak, last activity, window attempts /
solves / XP / pass rate, breakdowns by difficulty, module and tag, problems they
are stuck on and recent solves. Resolution is deterministic
(`internal/api/insight_subject.go`):

1. full name (“aisha bello”) or username (`aisha_b`, `@aisha_b`)
2. a first name of at least three characters, only when exactly one student
   matches — ambiguous names resolve to nobody rather than the wrong person

## Conversation memory

Threads and messages live in `admin_insight_threads` /
`admin_insight_messages` (`migrations/057_admin_insight_threads.sql`). Each turn
sends the last 8 turns of narrative text (each capped at 1 400 characters) so
follow-ups like “why?” or “and last week?” resolve without the admin repeating
themselves. Snapshots and reports are never sent back to the model — only the
prose is.

Both turns are persisted **after** generation succeeds, so a failed answer never
leaves an unanswered question in the transcript. Threads are owner-scoped on
every read and write; a foreign thread id returns 404, never another admin's
data.

## Caching and cost

First-turn answers are cached for 30 minutes in `admin_insight_reports`, keyed
by `(period, sha256(period + subject + lowercase question))`. Follow-up turns are
not cached because the same words can mean different things in different
threads. The cache row stores the snapshot alongside the prose so a cache hit
cannot disagree with its own numbers. The provider keeps its process-wide
one-request-per-second gap, and the AI limiter caps each admin at 15 requests a
minute.

## Privacy

The model sees aggregate metrics, display names/usernames of ranked and at-risk
students, and one named student's aggregates. It never sees emails, student IDs,
code, submission output, feedback text or raw rows. The question, history and
every data block are delimited as untrusted data in the prompt.

## UI

`frontend/components/admin/AdminInsightsPanel.tsx` is a two-pane conversation:

- saved threads on the left, one-click new chat
- streaming answer bubble with headline and Markdown narrative
- cards under each answer (`AdminInsightCards.tsx`): metric tiles with deltas,
  clickable XP leaderboard, at-risk list, skill-gap bars, three takeaway columns
- per-student profile card when the question named someone
- follow-up chips generated from the answer
- a collapsible detail row with curriculum funnel, level distribution and the
  activity feed
- copy / export the answer as Markdown

Clicking a leaderboard or at-risk row asks about that student, which is the
fastest path from “who is down?” to “why?”.

## Verification

Covered by:

- `internal/api/insights_test.go` — legacy one-shot endpoint
- `internal/api/insights_threads_test.go` — streaming frames, persistence,
  history, owner scoping, period validation, name resolution
- `internal/enricher/insights_test.go` and `insights_stream_test.go` — prompt
  grounding, history/student blocks, sanitisation, incremental extraction

`go build ./...`, `go vet ./internal/...`, `go test ./internal/...`,
`npx tsc --noEmit`, ESLint and `next build` pass.

**Not yet verified against a live database.** The queries are SQL-only and were
never executed against PostgreSQL in this environment (no database, no root).
Before shipping, apply migrations 001–057 to a real `DATABASE_URL`, open
`/admin`, then ask a question and confirm: a thread appears in the sidebar, the
answer streams, the cards match the numbers, a named student resolves, and
deleting the thread removes it from the list.

**Not viewed in a browser.** The panel compiles and type-checks but was not
opened in a running app, so spacing, dark-theme contrast and the mobile thread
picker still need one manual look.
