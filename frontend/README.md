# Koder Frontend

Next.js 15 (App Router, React 19) frontend for the Koder automated code-grading platform. Features a Monaco Editor workspace, Pyodide client-side Python execution, curriculum CMS, and real-time WebSocket updates.

## Setup

```bash
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL (default http://localhost:8080)
# Set NEXT_PUBLIC_GOOGLE_CLIENT_ID
npm run dev
```

## Build

```bash
npm run build    # Copies Monaco workers + builds Next.js
npm run start    # Production server
```

## Scripts

| Script | Command |
|---|---|
| `dev` | `next dev` |
| `build` | `node scripts/copy-monaco.mjs && next build` |
| `lint` | `eslint .` |
| `clean` | `next clean` |
