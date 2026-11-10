# Koder Design System

Standing brief for all Koder UI work. Read this before any frontend change.

> **Precedence with installed skills**
>
> This file is the brand source of truth. `cleanui`, `design-better`, `frontend-design`,
> and `impeccable` supply structure, craft, and taste — they do **not** override Koder brand
> choices. Where a skill contradicts this file, this file wins.
>
> Known conflicts, resolved in favor of Koder:
>
> | Skill says | Koder does |
> | --- | --- |
> | Ban `font-extrabold` | Titles stay extrabold (22–28px, tight tracking) |
> | Max 2 uppercase tracked labels per page | Micro labels are a system primitive (`text-micro`, 10–11px, `tracking-wider` — never wider) |
> | Desktop dashboard = 240–260px sidebar | Mobile-first shell with 5-tab bottom bar; `nav` breakpoint at 900px |
> | Generate a new palette / try a light theme | Charcoal + gold only; no new color system |
> | Add a hero section to orient the page | Dense, intentional layouts — no large empty regions |

---

## Product

**Koder** is a mobile-first coding practice platform (Go + Python). Dark charcoal interface, gold accents, dense but readable layouts. UI changes only unless logic is explicitly requested. Preserve data fetching, handlers, and navigation.

---

## Brand palette

| Token | Value | Use |
| --- | --- | --- |
| Background | `#121212` / `brand-charcoal-base` | Page canvas |
| Surface / card | `#1C1C1E`–`#1E1E1E` / `brand-charcoal-card` | Cards, panels |
| Chrome / header | `brand-charcoal-chrome` | Top bars |
| Border | `border-border/50`–`/70` | Subtle card edges |
| Gold / primary | `#D4AF37` / `brand-muted-gold` / `primary` | CTAs, active tabs, XP, emphasis |
| Off-white text | `brand-offwhite` / `foreground` | Primary copy |
| Muted text | `brand-offwhite-muted` / `muted-foreground` | Secondary labels |
| Success | Emerald (`brand-success`) | Solved, accepted |
| Error | Red / destructive | Failures, sign out |
| Accent (AI) | Violet / purple | AI Analysis only — not brand gold |

No pure white backgrounds. No neon gradients on chrome. Gold is for actions and status, not decoration overload.

---

## Typography

- **Greeting:** ~13px semibold, gold/primary — visible, not tiny grey
- **Name / page titles:** 22–28px extrabold, tight tracking
- **Section titles:** 14–16px semibold
- **Body:** 14–15px, comfortable line-height (~1.5–1.6)
- **Micro labels:** `text-micro` / 10–11px uppercase tracking-wider
- **Monospace:** ranks, XP, runtimes, code only

Prefer **bold and readable** over compact micro-UI. Problem description and workspace copy should feel slightly larger and heavier than default body.

---

## Layout & spacing

- Mobile-first; breakpoint `nav: 900px` for desktop shell
- Prefer **tight, intentional spacing** — no large empty regions
- Cards: `rounded-xl`–`rounded-2xl`, light border, no heavy drop shadows
- Lists: vertical card rows, full width, `max-w-full`, no horizontal scroll
- Padding: typically `px-3`–`px-4`; keep content inside safe areas
- Bottom tab bar + safe-area insets respected always

---

## Core patterns

### Navigation

- Fixed **5-tab** bottom bar: Home · Problems · Learn · Ranks · Profile
- Active tab: gold icon + gold underline/indicator
- Workspace sub-tabs: Problem · Code · Output · Hints · More

### Cards

- Dark surface, 1px muted border, 12–16px radius
- Clear hierarchy: title → meta → actions
- Avoid overlapping badges/buttons on one row on mobile

### Stats

- 2×2 or 4-up tiles on home
- Compact metric strips (not oversized empty cards)
- Tabular nums for XP, ranks, times

### Badges

- Difficulty: colored pill (Beginner → Expert)
- Solved: emerald pill with check
- XP: **one** gold chip, fixed position (don't duplicate in header + body)
- Level: small solid card (icon + "Level" + number) — not a soft "AI pill"

### Buttons

- Primary CTA: solid gold, dark text, full-width on mobile when primary
- Secondary: muted border / ghost
- Destructive: red text + light red hover

### Menus / popovers

- Rounded-2xl card, soft border, strong shadow
- Header block (avatar + name + XP)
- Icon-in-tile rows for Profile / Settings / Admin
- Sign Out clearly separated and destructive

### Leaderboard

- Podium for top 3 (balanced 3-column)
- Dense rank list below — **no** wide tables that force horizontal scroll on mobile

### Output / errors

- Human-readable messages (not raw `=== RUN` / `--- FAIL`)
- Clear "Your result" vs "Expected"
- Friendly section labels ("What went wrong")

### Announcements

- Single line of meaning: if title ≈ body, show once
- Compact banner, dismissible, aligned to content width

### Best Practices

- Filters in **two clean rows** (scope + language; sort + search)
- Solution rows: author on first line; **AI Analysis** and likes without overlapping text
- AI controls use violet; keep gold for core product actions

---

## Do

- Match existing charcoal + gold system
- Keep UI-only diffs when asked
- Make text **bold and legible** on small screens
- Fix overflow (`max-w-full`, padding, no sideways scroll)
- Align badges so long titles don't shove XP/status
- Default contribution graph to **current month** (scroll to end)
- Reuse existing components (`shadcn`, mobile shell, design tokens in `globals.css`)

## Don't

- Introduce a new color system or light theme
- Use emoji as primary icons (prefer Lucide / real SVG)
- Stack overlapping pills on narrow rows
- Show raw test-runner logs to end users
- Duplicate XP or status in multiple top bars
- Add large empty whitespace "for air"
- Break logic, routes, or API contracts for visual polish

---

## Voice for UI copy

Short, clear, confident. Prefer "Case 2 failed — expected 0.0, got 1.5" over framework noise. Labels uppercase micro for meta; sentence case for body.

---

## Implementation note

When delivering changes: UI-only patches, file paths, and copy-paste deploy steps. If push isn't available, provide artifacts the same way. For backend issues (e.g. Go execution), investigate with evidence — don't guess behind a pure CSS fix.

---

## Tooling

Installed agent skills (`.agents/skills/`, symlinked into `.claude/skills/`):

| Skill | Role |
| --- | --- |
| `cleanui` | Blocks generic AI-UI patterns — typography, layout-by-content-type, real icon libraries, loading/empty states |
| `design-better` | Craft heuristics — hierarchy, interaction, accessibility, motion, polish (style comes from this file) |
| `frontend-design` | Aesthetic direction and non-templated visual choices |
| `web-design-guidelines` | Accessibility and Web Interface Guidelines audit pass |
| `design-mobile-apps` | Mobile screen patterns |
| `i-have-adhd` | Output style only (`/i-have-adhd`), no effect on the design |
