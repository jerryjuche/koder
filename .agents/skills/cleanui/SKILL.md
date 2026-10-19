---
name: cleanui
description: Prevents generic AI-generated UI patterns when building web apps, mobile apps, and websites. Enforces clean, professional design with proper typography, layout structure, and platform-aware patterns. Use this skill whenever generating React, React Native, SwiftUI, Jetpack Compose, HTML/CSS, or any frontend UI code.
version: 1.0.0
---

# CleanUI — AI UI Design Enforcement Skill

> **STOP. Before you write ANY UI code, read this file.**
>
> You are an AI code generator with deeply ingrained UI habits that produce recognizable "AI-looking" output. This skill exists to override those habits and produce professional, human-designed interfaces.
>
> **Your process for every UI task:**
> 1. Think about what you would NORMALLY generate
> 2. Check each element against the HARD NO list below
> 3. Replace every violation with the specified alternative
> 4. Only then write the code

---

## HARD NO LIST — AUTOMATIC FAIL PATTERNS

If your output contains ANY of these, stop and fix before returning code.

### Typography
- **BANNED:** `font-extrabold` (800), `font-black` (900), `fontWeight: "800"`, `fontWeight: "900"`
- **USE INSTEAD:** `font-bold` (700) max. `font-semibold` (600) for section headings.
- **SELF-CHECK:** Search your code for "extrabold" and "black". Replace all with "bold".

### Logo / Trust Bars
- **BANNED:** Company names as identical plain text in identical bordered pills/boxes
- **USE INSTEAD:** Make each logo visually distinct — pair icons with names, vary weight/italic/tracking per logo, or use SVG logos
- **SELF-CHECK:** Do all logos look identical? Fix it.

### Uppercase / Letter Spacing
- **BANNED:** `tracking-[0.18em]`, `tracking-[0.2em]`, `tracking-[0.24em]` or any custom wide letter-spacing
- **BANNED:** More than 2 uppercase tracked labels on the entire page
- **USE INSTEAD:** Sentence case. If uppercase needed, `tracking-wider` (0.05em) max.

### Eyebrow Badges
- **BANNED:** Decorative pill/badge above headlines that restates what the headline says (e.g., "AI writing system for content teams")
- **USE INSTEAD:** Remove entirely, or use factual info: "Now in beta", "Trusted by 2,400 teams", "Free plan available"

### Hero Headlines
- **BANNED:** Headlines wrapping to 4+ lines on desktop
- **USE INSTEAD:** 4-8 words, max 2 lines. Rewrite shorter.
- **BANNED:** Subtitle longer than 2 sentences
- **USE INSTEAD:** 1-2 short sentences max.

### Decorative Copy
- **BANNED:** Ornamental labels like "Live pulse", "Night shift", "Operational clarity without the clutter"
- **USE INSTEAD:** Real data (status, counts, dates) or remove entirely. Every label must serve a function.

### Shadows
- **BANNED:** `shadow-xl`, `shadow-2xl`, blur above 8px on cards
- **USE INSTEAD:** `shadow-sm` or `shadow-none` with subtle border.

### Border Radius
- **BANNED:** Random mixing of `rounded-md`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-[24px]`, `rounded-[32px]`
- **USE INSTEAD:** Pick 2-3 values. Cards: 8-12px. Buttons: 6-8px (or `rounded-full` for pills). Inputs: 6-8px. Be consistent.

### Icons
- **BANNED:** Unicode characters as icons (`↑`, `↓`, `◌`, `⌂`, `◫`)
- **USE INSTEAD:** lucide-react (web), @expo/vector-icons (React Native), SF Symbols (iOS), Material Icons (Android)

### File Structure
- **BANNED:** Entire app in a single file
- **USE INSTEAD:** Separate: screens/pages, components, constants/theme, data, navigation

---

## LAYOUT RULES

### Match Layout to Content Type

| Content Type | Layout | Don't Use |
|---|---|---|
| Images/visual (food, travel, products) | Horizontal carousels, image grids, hero images | Text-only vertical lists |
| Data/numbers (finance, fitness, analytics) | Stat cards, progress bars, metric grids | Hero image cards |
| Feed (social, news, posts) | Full-width stacking cards, infinite scroll | Sectioned layout with drag handles |
| Items to browse (e-commerce, tasks, email) | Vertical list with search/filters | Hero sections |
| Multimedia (streaming, music, podcasts) | Horizontal scroll shelves (Netflix-style) | Vertical lists |
| Chat/messages | Contact list + chat detail | Hero cards or stat grids |
| Maps/location | Map view + bottom sheet overlay | Standard list layout |

### Anti-Templating Rules
- **NEVER use the same layout skeleton for every app.** Read the prompt, identify the content type, pick the right layout.
- **NEVER use ALL of these together:** hero card + grid buttons + drag handle + segmented control + vertical list. That's a template.
- If the app is image-heavy, show **actual images** — thumbnails, photos — not just icons in rounded squares.
- Use **horizontal scrolls** (`FlatList horizontal`, CSS `overflow-x-auto`) for categories, featured items, content shelves. AI generators underuse these.

---

## DESIGN TASTE

### Color Restraint
- Monochrome or near-monochrome palettes often look better than colorful ones.
- Color should appear mainly in actions (buttons, links), status (badges), and highlights (selected states). Not on everything.
- Dark elements (cards, sections) are justified ONLY when they represent a real-world object (credit card, media player, code block) or create deliberate visual rhythm. Not just "for variety."

### List Items
- **NEVER use letter initials as the only identifier.** Use category-specific icons (utensils for restaurant, bus for transport, repeat for subscription) in rounded squares.
- Always include **metadata**: date/time, category, status. "Restaurant" feels fake. "Restaurant · May 5 · 14:28" feels real.

### Filters
- Any list with 5+ items should have a filter or segmented control.
- Segmented control: pill-track style with solid fill on selected segment.

### Action Buttons
- Borderless style often looks cleaner: icon in muted-background square + label below. No card wrapper, no shadow, no border needed.

---

## MOBILE RULES

See [Mobile Patterns Reference](references/mobile-patterns.md) for full iOS color palettes, Android Material 3 tokens, component guidelines, and code examples.

### All Platforms
- Use **real navigation libraries**, not custom View-based nav bars. React Native: `@react-navigation/bottom-tabs`. iOS: `TabView`. Android: Material `NavigationBar`.
- **NEVER build floating pill-shaped bottom nav bars.** No `position: absolute`, no `borderRadius: 28`, no dark floating pill.
- Use **Platform.select()** or **Platform.OS** for conditional styling in React Native.
- Define design tokens (colors, spacing, radii, typography) in a constants file.
- Handle 3 states per screen: loading (skeletons), content, empty.

### iOS
- Quiet, soft, premium. Restrained color. System fonts (SF Pro). Semantic colors (`.label`, `.secondaryLabel`, `.systemBackground`). Translucent nav/tab bars. `listStyle(.insetGrouped)`. SF Symbols for icons. Hairline separators. Corner radius: 10-12. No heavy shadows — use background contrast.

### Android (Material 3)
- Structured, bold, expressive. Material components from `material3`. Tonal surfaces (`tonalElevation`) instead of drop shadows. `Scaffold` with `TopAppBar` + `NavigationBar`. `ListItem` composable for list rows. `HorizontalDivider()` between items. Corner radius: 12dp for cards. Generate color scheme from seed color.

### React Native / Expo
- Platform-conditional colors, shadows, and spacing via `Platform.select()`.
- iOS uses `shadowColor`/`shadowOpacity`/`shadowRadius`. Android uses `elevation`.
- Different background colors per platform: iOS `#F2F2F7`, Android `#F9F9FF`.
- Different primary colors: iOS `#007AFF`, Android uses Material seed color.

---

## WEB RULES

### Creative Freedom + Structure
You have freedom on: color palette, font choice, border radius values, brand personality, background treatments.

You must follow: section structure, hero content limits, component patterns, responsive behavior.

### Navigation
- Sticky top with `backdrop-blur` and semi-transparent background
- Logo left, nav links center, CTA buttons right
- Mobile: hamburger menu

### Landing Page Structure
```
Hero       → headline + subtitle + 2 CTAs + one trust element
Trust      → logo bar (visually distinct logos)
Features   → 3-column grid with icons + title + description
How it works → 3-step process
Testimonials → avatar + name + role + quote
Pricing    → 2-3 tiers, featured tier visually inverted (dark bg)
CTA        → final call to action
Footer     → link columns + copyright
```

### Hero
- Headline + short subtitle + 2 buttons + one trust element. That's it.
- Product mockup/screenshot on the right side of a two-column hero is fine.
- Do NOT put stat cards, complex preview cards with lists, or multi-paragraph descriptions in the hero.

### Feature Cards
- Icon container: at least 48px with tinted background. Not tiny.
- Card padding: generous (p-6 to p-8).
- Each card should feel full — icon + title + description.

### Pricing
- Featured tier: inverted (dark bg, light text) or thicker border + "Most popular" badge.
- Full-width CTA in each card.

### Sign-In
- Two-column: brand panel (left, dark) + form (right).
- Social login above email form.
- Mobile: hide brand panel, show form with logo.

### Dashboard
- Sidebar (240-260px) + main content.
- Sidebar: logo, nav items with icons, optional upgrade card.
- Top bar: search + notifications + avatar.
- Content: greeting → stat cards → filtered list with tabs → activity feed.

### Dark Mode
- Background: very dark gray, not pure black.
- Text: off-white, not pure white.
- Borders: dark gray. Reduce color saturation.

---

## PRE-OUTPUT CHECKLIST

Before returning code, verify:

**Typography:**
- [ ] No `font-extrabold` or `font-black` anywhere
- [ ] Max 2 font weights used (regular + bold/semibold)

**Visual:**
- [ ] No `tracking-[0.18em]` or wider
- [ ] Max 2 uppercase labels on the entire page
- [ ] Logo bar items look visually distinct from each other
- [ ] No shadow-xl or shadow-2xl on cards
- [ ] Consistent border radius (2-3 values max)

**Hero:**
- [ ] Headline fits in 2 lines on desktop
- [ ] Eyebrow badge (if present) adds new info, doesn't restate headline
- [ ] Subtitle is 1-2 sentences, not a paragraph

**Structure:**
- [ ] Multiple files (screens, components, constants, navigation)
- [ ] Real icon library (not Unicode)
- [ ] Platform-specific styling (React Native)
- [ ] Loading/empty states exist

**Layout:**
- [ ] Layout matches content type (not the same template every time)
- [ ] List items have category icons + metadata
- [ ] Lists with 5+ items have filters
