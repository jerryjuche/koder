# CleanUI

A UI design skill for Codex that produces better-looking mobile apps and websites.

## Output

| Without the skill | With the skill |
  |---|---|
  | <img width="343" height="693" alt="Bildschirmfoto 2026-03-30 um 22 27 41" src="https://github.com/user-attachments/assets/e118273e-c60d-47f3-85ee-92f6d35a18ac" /> | <img width="345" height="692" alt="Bildschirmfoto 2026-03-30 um 22 29 29" src="https://github.com/user-attachments/assets/9aa3dbbb-ad02-4af7-bea5-a5bec587dcc0" /> |
  | <img width="363" height="694" alt="Bildschirmfoto 2026-04-01 um 12 53 01" src="https://github.com/user-attachments/assets/f9c455c7-e274-4ddf-86f4-ecd761c54e0a" /> | <img width="342" height="686" alt="Bildschirmfoto 2026-04-01 um 12 53 13" src="https://github.com/user-attachments/assets/3bcaf72a-8467-4dd8-8fab-f3c5c84568f9" /> |

All of these images were created using Expo, and are the web version, which means you can run them in the terminal with expo start --web.

## The Problem

Codex generates UIs that look like AI made them — dark floating nav bars, Unicode icons, the same layout template for every app, no metadata on list items, and overall flat, lifeless designs.

## The Fix

CleanUI is a skill that teaches Codex to generate UIs that look like real shipping apps. It enforces proper structure, layout variety, platform-native patterns, and design taste.

## Install

```bash
npx skills add peterhdd/cleanui
```

## What It Covers

- **Hard No List** — Banned patterns that AI generators consistently produce
- **Layout Intelligence** — Match layout to content type instead of reusing the same template
- **Design Taste** — Color restraint, category icons, metadata on list items, filters
- **Mobile Rules** — iOS (HIG), Android (Material 3), React Native cross-platform
- **Web Rules** — Landing pages, sign-in pages, dashboards, navigation, pricing, testimonials
- **Pre-Output Checklist** — Verification list to catch issues before code is returned

## Tested Across

| Domain | Platform | Result |
|---|---|---|
| Banking app | Expo (iOS/Android) | Category icons, metadata, filters, proper nav |
| Fitness tracker | Expo (iOS/Android) | Activity metrics, workout icons, streak cards |
| Recipe app | Expo (iOS/Android) | Image grids, horizontal scroll categories |
| SaaS landing page | React + Tailwind | Proper hero, sections, pricing, footer |
| Sign-in page | React + Tailwind | Two-column brand + form layout |
| Dashboard | React + Tailwind | Sidebar, stat cards, filtered lists, activity feed |

## License

MIT
