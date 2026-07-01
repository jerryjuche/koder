# Google Sign-In Integration — Debug Document

## Current Problem

The "Link Google Account" button in Settings (and the banner) doesn't trigger Google authentication. The user sees the Google Sign-In button appear briefly then disappear, or the button appears but clicking it does nothing. The GIS (Google Identity Services) library is loaded but `renderButton` doesn't render a clickable button into the target container.

### Console Errors Seen

```
[GSI_LOGGER]: FedCM get() rejects with AbortError: signal is aborted without reason

accounts.google.com/gsi/status?client_id=...  403 (Forbidden)

Cross-Origin-Opener-Policy policy would block the window.postMessage call.

[GSI_LOGGER]: Provided button width is invalid: 100%
```

---

## Architecture Overview

### Backend Flow

```
POST /auth/google  (login page — Google Sign-In)
  → VerifyGoogleToken(id_token)
  → Find user by google_id OR by email
  → If found by email, auto-link Google to that account
  → If not found → 404 GOOGLE_NOT_LINKED error
  → Returns JWT

POST /auth/link-google  (settings/banner — Link existing user)
  → Requires auth (JWT in Authorization header)
  → Verifies Google ID token
  → Checks google_id not already linked to another user
  → Checks email not already used by another user
  → Links Google to the authenticated user (UPDATE users SET google_id = ...)
  → Returns new JWT

GET /me  → returns { ..., google_linked: bool }
```

### Frontend Architecture

**Shared hook:** `hooks/use-google-one-tap.ts`
- Module-level singleton: loads GIS script once, calls `initialize()` once
- All 4 consumers (login, register, settings, banner) share it via `const { renderButton, prompt, ready } = useGoogleOneTap(callback)`
- `ready` = `useState` that flips to `true` after script loads + init attempt completes
- `renderButton(element)` = renders visible Google Sign-In button into a DOM element (popup flow)
- `prompt()` = triggers FedCM-based One Tap dialog (only for login auto-prompt)

**Login Page:** `app/(auth)/login/page.tsx`
- GIS button rendered directly into `googleButtonRef` div
- Uses `mounted` state to prevent hydration mismatch
- On credential callback: calls `POST /auth/google`, redirects to `/` or `/onboarding`

**Register Page:** `app/(auth)/register/page.tsx`
- Same pattern as login: GIS button rendered directly, `mounted` state for hydration
- On credential callback: calls `POST /auth/google`

**Settings Page:** `app/(main)/settings/page.tsx`
- **Current approach:** When `ready`, renders `<div ref={gisRef}>` and calls `renderButton(gisRef.current)` in a `useEffect`
- On credential callback: calls `POST /auth/link-google` with the ID token
- If not ready: shows a disabled "Link Google Account" fallback button

**GoogleLinkBanner:** `components/GoogleLinkBanner.tsx`
- Same approach as Settings: `renderButton` into `gisRef` div when `ready`
- Auto-hides when `user.google_linked` is `true` or when dismissed via localStorage
- Amber gradient banner with AlertTriangle icon

---

## What Has Been Tried

### 1. Initial Approach: `prompt()` (FedCM One Tap)
- Settings and banner called `prompt()` which uses FedCM to show the Google One Tap dialog
- **Problem:** FedCM fails on localhost/non-secure origins with `AbortError: signal is aborted without reason`
- The GIS status endpoint returns 403, blocking FedCM

### 2. Hidden Div + Programmatic Click
- Rendered a hidden GIS button via `renderButton()` into a `className="hidden"` div
- When user clicked custom "Link Google" button, we queried `gisRef.current.querySelector('[role="button"]')` and called `.click()`
- **Problem:** GIS refuses to render into `display: none` elements (no dimensions to calculate layout)
- Programmatic `.click()` on invisible elements may not trigger GIS's internal event handlers

### 3. Direct GIS Button (Current)
- When `ready` is true, render `<div ref={gisRef} style={{ width: '100%', minHeight: '40px' }} />` and call `renderButton(gisRef.current)` in a `useEffect`
- **Current Problem:** The button appears briefly then disappears, or appears but is unclickable

### 4. `ready` Signal Fixes
- **V1:** `ready` was static `typeof window !== "undefined" && !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID` — true on client immediately, but GIS script hadn't loaded
- **V2:** `ready` became `useState` that only flipped `true` after `initialize()` succeeded — but `initialize()` throws on localhost due to FedCM, so `ready` stayed `false` forever
- **V3 (current):** `ready` flips `true` after init attempt completes regardless of success/failure; `initialize()` stripped of FedCM-specific options (`cancel_on_tap_outside`, `itp_support`)

### 5. `initialize()` Options Changes
- **Before:** `{ client_id, callback, cancel_on_tap_outside: true, itp_support: true }`
- **Now:** `{ client_id, callback }` — minimal; removed One Tap-specific options that trigger FedCM mediation during init

### 6. `renderButton()` Width Fix
- **Before:** `width: '100%'` — invalid, GIS expects numeric pixel value → caused "Provided button width is invalid: 100%" warning
- **Now:** `width: 350` (numeric) — still trying 350, but perhaps should match container width

---

## Suspected Root Causes

### A. GIS `initialize()` is required for `renderButton()`
Even though `ready` now fires regardless of init success, `renderButton()` internally depends on the configuration set by `initialize()`. If `initialize()` threw before setting client_id/callback, `renderButton()` may render an empty/disfunctional button. **The try-catch swallows the actual error.**

### B. Cross-Origin-Opener-Policy (COOP) blocks popup
The `Cross-Origin-Opener-Policy policy would block the window.postMessage call` error suggests the browser's security policy is blocking the popup from communicating back to the opener. This would cause GIS to open a blank popup that never returns the credential.

### C. GIS `/gsi/status` 403 kills the flow
Google's `/gsi/status` endpoint returns 403, which may cause GIS to internally disable all UI rendering (button and prompt). The origin (localhost:3000) may not be authorized for this client ID in Google Cloud Console.

### D. Container sizing issues
If the container div has zero width/height at the moment `renderButton()` is called, GIS may render a zero-sized button or fail silently. The container has `width: '100%'` but the parent may have flex constraints that collapse it.

---

## Files Involved

| File | Role |
|------|------|
| `frontend/hooks/use-google-one-tap.ts` | Shared GIS singleton hook (script load, init, prompt, renderButton) |
| `frontend/components/GoogleLinkBanner.tsx` | Dashboard banner for unlinked users |
| `frontend/app/(main)/settings/page.tsx` | Settings page "Link Google Account" section |
| `frontend/app/(auth)/login/page.tsx` | Login page Google Sign-In button |
| `frontend/app/(auth)/register/page.tsx` | Register page Google Sign-In button |
| `frontend/lib/api.ts` | `googleLogin()`, `linkGoogle()`, `completeOnboarding()` |
| `frontend/lib/types.ts` | `google_linked: boolean` in `User` type |
| `internal/api/auth.go` | `GoogleAuth`, `LinkGoogle`, `CompleteOnboarding` handlers |
| `internal/api/me.go` | `google_linked` field in `/me` response |
| `internal/auth/oauth.go` | `VerifyGoogleToken()` — calls `tokeninfo` endpoint |
| `internal/store/users.go` | `LinkGoogleToUser`, `GetUserByGoogleID`, `GetUserByEmail` |

---

## What Needs Debugging

1. **Log the actual error from `initialize()`** — the try-catch swallows it. Either remove the catch temporarily or log to console.
2. **Check if `renderButton()` actually renders children** — add `console.log(gisRef.current?.childElementCount)` after calling `renderButton()`.
3. **Check if the issue is COOP** — test on a production HTTPS URL instead of localhost.
4. **Check Google Cloud Console** — verify the client ID has `http://localhost:3000` (or the actual origin) in its list of authorized JavaScript origins.
5. **Test `renderButton` with hardcoded pixel width** — the container may need an explicit width like `400px` instead of `100%`.

### Quick Test Ideas
- Replace `<div ref={gisRef} style={{ width: '100%', minHeight: '40px' }} />` with `<div ref={gisRef} style={{ width: '400px', height: '40px', border: '1px solid red' }} />` to see if it renders anything.
- Add `console.log('window.google:', !!window.google, 'initialized:', initialized)` in the `renderButton` effect.
- Try calling `window.google.accounts.id.renderButton(...)` directly in the browser console.
