# Azure Sandbox Deployment Runbook

> **Service:** Koder code-execution sandbox (`sandbox/`)
> **Image:** `ghcr.io/jerryjuche/koder-sandbox` (public)
> **Host:** Azure Container Apps — consumption plan, `westeurope`
> **Budget:** ~$18–22/mo (always-warm, 1 replica; revert to $0 via scale-to-zero)
> **Status:** **LIVE (2026-07-31)** — Fly.io retained as rollback only
> **Last updated:** 2026-08-02

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Cost Model](#3-cost-model)
4. [Prerequisites](#4-prerequisites)
5. [Step 1 — Build & Push the Image](#5-step-1--build--push-the-image)
6. [Step 2 — Deploy to Azure Container Apps](#6-step-2--deploy-to-azure-container-apps)
7. [Step 3 — Verify](#7-step-3--verify)
8. [Step 4 — Point the Backend at It](#8-step-4--point-the-backend-at-it)
9. [Operations](#9-operations)
10. [Troubleshooting](#10-troubleshooting)
11. [Teardown](#11-teardown)
12. [Quick Reference](#12-quick-reference)

---

## 1. Overview

The sandbox is a standalone Go service that executes student `go test` / `python3`
submissions in isolation (regex blocklist → AST validation → `setrlimit` kernel
limits → container). It exposes three endpoints:

| Endpoint | Purpose |
|---|---|
| `GET /health` | Liveness probe (bypasses the rate limiter) |
| `GET /version` | Build metadata (bypasses the rate limiter) |
| `POST /execute` | Run one submission; rate-limited per IP |

The backend (`internal/executor/`) calls it over HTTPS when `SANDBOX_URL` is set
and falls back to local Docker when it is empty — the API contract is unchanged.

### Why Azure Container Apps?

### Why Azure Container Apps?

| Consideration | Fly.io (rollback only) | Azure Container Apps (active) |
|---|---|---|
| Cost at idle | Paying per active machine | ~$18–30/mo — always-warm, 1 replica (consumption billing) |
| Cold start | ~800ms | **~0ms** — `minReplicas: 1` keeps a replica warm |
| Registry | N/A (direct deploy) | Pulls a public **GHCR** image — no registry fee |
| Runtime | `golang:1.26-alpine` + python3 | Same container, unchanged `Dockerfile` |

> **Why ACR?** Azure Container Registry has no free tier — the cheapest SKU
> (Basic) is ~$5/mo. A **public GHCR image** is pullable by ACA anonymously, so
> no registry fee is charged on top of the always-warm compute cost.

---

## 2. Architecture

```
Student code
      │  POST /execute {language, code, test_code, timeout_sec, ...}
      ▼
Backend (Render) ──SANDBOX_URL──► koder-sandbox.ashysmoke-c753df92.westeurope.azurecontainerapps.io
      │                              (Azure Container Apps — consumption plan)
      │                              ├── HTTPS ingress → target port 8080
      │                              ├── 0.5 vCPU / 1.0Gi per replica
      │                              ├── scale: min 1 / max 4 (HTTP rule @ 50 req)
      │                              ├── /health, /version, /execute
      │                              └── Go test / Python3 runners (unchanged)
      └─ falls back to local Docker when SANDBOX_URL is empty

Image supply chain:
  GitHub Actions (.github/workflows/sandbox-publish.yml)
      └─► build ./sandbox ──► push ghcr.io/jerryjuche/koder-sandbox
                                  ├── :latest          (rolling)
                                  └── :sha-<12>        (immutable, pin/rollback)
          ACA pulls the public image anonymously (no credentials)
```

The image lifecycle is fully decoupled from the deploy step: any push touching
`sandbox/**` on `main`/`staging` produces a fresh image; `deploy.sh` (or a
manual `docker push`) makes it live.

---

## 3. Cost Model

| Component | Location | Cost |
|---|---|---|
| Container image | `ghcr.io/jerryjuche/koder-sandbox` (public) | Free |
| Image build + push | GitHub Actions (public repo minutes) | Free |
| Execution runtime | ACA consumption — 1 always-warm replica (`0.5 vCPU / 1.0Gi`) | **~$18–22/mo**, per-second billing |
| ACA environment | Consumption-only environment | No base charge |
| Storage / logs | ACA Log Analytics within free allowances | $0 at this scale |

**Billing behavior:** consumption billing accrues per-replica **only while a
replica is running**. `minReplicas: 1` keeps one replica warm at all times so a
submission never waits on a cold start (~30s); in exchange the warm replica
accrues a small, steady compute charge during active hours. `maxReplicas: 4`
bounds any burst of scale-out beyond that warm baseline.

**Estimated monthly:** ~0.5 vCPU + 1 GiB, billed ~24/7 ≈ **$18–22/mo**
(appetite-dependent; verify actual consumption in Azure Cost Management).

**Reverting to $0 scale-to-zero:** set `MIN_REPLICAS=0` in `deploy.sh` and
`minReplicas: 0` in `container-app.yaml`, then re-run `deploy.sh`. Idle cost
drops to $0, but the first run after an idle period pays a ~30s cold start.

**Cost guardrails in the deploy:** `minReplicas 1` / `maxReplicas 4` bounds the
footprint, and `0.5 vCPU / 1.0Gi` is the smallest practical profile for
`go test` + python3.

---

## 4. Prerequisites

| Tool | Version | Notes |
|---|---|---|
| `az` CLI | ≥ 2.60 | `containerapp` extension auto-installed by `deploy.sh` if missing |
| `docker` | ≥ 24 | Only needed for manual image builds/pushes |
| `gh` + PAT | — | Only needed for manual pushes (`gh` optional; a PAT with `write:packages` scope works with `docker login ghcr.io`) |
| `curl` | — | Verification |

Verify login and the target subscription:

```bash
az login
az account show --query '{name:name,id:id}' -o json
```

> **Do not** deploy against an unexpected subscription — confirm the `name`/`id`
> printed by `deploy.sh` matches the intended billing scope.

---

## 5. Step 1 — Build & Push the Image

### Option A — Automated (recommended)

`.github/workflows/sandbox-publish.yml` builds `./sandbox` and pushes both
`ghcr.io/jerryjuche/koder-sandbox:latest` and `:sha-<12>` on every push to
`main`/`staging` that touches `sandbox/**`. The package is public, so ACA can
pull it without credentials.

Nothing to do locally — just merge to `main`/`staging`.

### Option B — Manual

```bash
docker build -t ghcr.io/jerryjuche/koder-sandbox:latest ./sandbox
docker login ghcr.io -u <github-username>     # PAT with write:packages scope
docker push ghcr.io/jerryjuche/koder-sandbox:latest
```

### Tag strategy

| Tag | Semantics | Use for |
|---|---|---|
| `:latest` | Rolling — overwritten each build | Default deployments |
| `:sha-<12>` | Immutable — one per build | Pinning a known-good image, rollbacks |

Roll back to a previous build by deploying the immutable tag, e.g.:

```bash
# in deploy.sh
IMAGE="ghcr.io/jerryjuche/koder-sandbox:sha-ab12cd34ef56"
```

---

## 6. Step 2 — Deploy to Azure Container Apps

### Using `deploy.sh` (recommended)

`sandbox/azure/deploy.sh` is an idempotent CLI script — re-running it updates
the app **in place** (new image, scale, env) rather than recreating it.

```bash
./sandbox/azure/deploy.sh --help      # usage summary
./sandbox/azure/deploy.sh --dry-run   # print every command, apply nothing
./sandbox/azure/deploy.sh             # apply (prompts for confirmation)
./sandbox/azure/deploy.sh --yes       # apply without the confirmation prompt
```

### What it creates

| # | Resource | Command (abridged) |
|---|---|---|
| 1 | Resource group `koder-sandbox` (`westeurope`) | `az group create ...` |
| 2 | Environment `sandbox-env` (consumption) | `az containerapp env create ...` |
| 3 | Container app `koder-sandbox` | `az containerapp create ...` |

### Container app definition

| Setting | Value | Rationale |
|---|---|---|
| Image | `ghcr.io/jerryjuche/koder-sandbox:latest` | Public — anonymous pull |
| Ingress | external, HTTPS → target port `8080` | Matches `Dockerfile` `EXPOSE 8080` |
| Compute | `0.5` vCPU / `1.0Gi` | Smallest practical profile; sandbox `RLIMIT_AS` is 512MB |
| Scale | `min 1` / `max 4` | Always-warm baseline (no cold-start waits) + bounded scale-out |
| HTTP rule | concurrency `50` | One replica per 50 concurrent requests |
| Env var | `SANDBOX_RATE_LIMIT_PER_MIN=60` | One backend IP fans out many submissions (default is 10) |

The script then polls `GET /health` (up to 300s) and prints the authoritative
FQDN. **Always use the URL it prints** — not a predicted one.

### Declarative alternative

Version the manifest instead of the script:

```bash
az containerapp create --resource-group koder-sandbox \
    --environment sandbox-env \
    --yaml sandbox/azure/container-app.yaml
```

`container-app.yaml` encodes the same settings (single active revision, external
ingress, 0.5 vCPU/1.0Gi, min 1/max 4, HTTP rule, env var) for repeatable,
reviewable deployments.

### Resulting URL

```
https://koder-sandbox.ashysmoke-c753df92.westeurope.azurecontainerapps.io
```

> **Note:** Azure appends a random suffix to the environment's default domain
> (`ashysmoke-c753df92` above), so the exact hostname can differ between
> environments even with the same `--name`. **Always use the FQDN that
> `deploy.sh` prints** (and copy it into `SANDBOX_URL` on Render) rather than
> predicting one.

---

## 7. Step 3 — Verify

```bash
BASE=https://koder-sandbox.ashysmoke-c753df92.westeurope.azurecontainerapps.io
```

### 7.1 Liveness + version

```bash
curl -fsS "$BASE/health"
curl -fsS "$BASE/version"
```

`/health` and `/version` bypass the rate limiter, so they are safe to poll.

### 7.2 End-to-end Python submission

Mirrors the executor's `pythonTestTemplate` — proves the full path through the
Pyodide-style runner on the container:

```bash
cat > /tmp/payload.json <<'JSON'
{
  "language": "python",
  "code": "def add(a, b):\n    return a + b\n",
  "test_code": "import sys, json\n\nsys.path.insert(0, '.')\nfrom solution import add\n\ntest_cases = [\n    {\"ordinal\": 1, \"inputs\": (2, 3), \"expected\": \"5\"},\n]\n\nprint(\"=== RUN TestSolution\")\n\npassed = 0\ntotal = len(test_cases)\n\nfor tc in test_cases:\n    ordinal = tc[\"ordinal\"]\n    inputs = tc[\"inputs\"]\n    expected = tc[\"expected\"]\n    try:\n        result = add(*inputs)\n        expected_val = json.loads(expected)\n        if result == expected_val:\n            passed += 1\n            print(f\"--- PASS: TestSolution/case_{ordinal}\")\n        else:\n            print(f\"--- FAIL: TestSolution/case_{ordinal}\")\n            print(f\"=== FAIL: Case {ordinal}\")\n            print(f\"GOT: {result}\")\n            print(f\"WANT: {expected}\")\n    except Exception as e:\n        print(f\"--- FAIL: TestSolution/case_{ordinal}\")\n        print(f\"=== FAIL: Case {ordinal}\")\n        print(f\"GOT: (exception) {e}\")\n        print(f\"WANT: {expected}\")\n\nprint(\"--- PASS: TestSolution\" if passed == total else \"--- FAIL: TestSolution\")\n"
}
JSON

curl -fsS -X POST "$BASE/execute" -H 'Content-Type: application/json' --data @/tmp/payload.json
```

**Expected:** `"status":"passed"`, `"passed_count":1`, `"total_count":1`.

### 7.3 Rate limiter

61 rapid requests to `/execute` from one IP should return `429
rate_limit_exceeded` on the last one (limit: 60/min via
`SANDBOX_RATE_LIMIT_PER_MIN`; the default is 10).

### 7.4 Always-warm baseline

`minReplicas: 1` keeps a replica running so the first submission never waits on
a cold start — the first and every-subsequent request are equally fast. Confirm
the baseline is active:

```bash
az containerapp show -n koder-sandbox --resource-group koder-sandbox \
    --query "properties.template.scale.minReplicas"
```

Expect `1`. Deploys still replace the revision in place; ACA keeps the rollout
available so a brief new-revision boot is invisible. The image pre-bakes the Go
build cache (see `sandbox/Dockerfile`), so even the rare first compile on a
fresh revision is fast, and `SANDBOX_REQUEST_TIMEOUT_EXTRA_SECONDS` (default 20)
covers that brief churn plus the student's `timeout_sec` hard cap.

---

## 8. Step 4 — Point the Backend at It

On Render (staging + production):

```bash
SANDBOX_URL=https://koder-sandbox.ashysmoke-c753df92.westeurope.azurecontainerapps.io
PYTHON_SANDBOX_URL=                    # leave empty
```

**Python routing:** `internal/executor/executor.go` uses `PYTHON_SANDBOX_URL`
when set, otherwise falls back to `SANDBOX_URL` — so a single variable covers
both languages. Leaving both empty reverts to the local-Docker path.

Update `.env.example` in the repo to match. Redeploy the backend and submit a
real problem end-to-end (both Go and Python) through the UI.

---

## 9. Operations

### Redeploy / update in place

```bash
./sandbox/azure/deploy.sh          # picks up a new :latest image + current settings
```

### Pin a known-good image

```bash
IMAGE="ghcr.io/jerryjuche/koder-sandbox:sha-<12>" ./sandbox/azure/deploy.sh
```

*(Edit `IMAGE` in the script's config block instead — the script reads it from
there.)*

### View logs

```bash
az containerapp logs show --name koder-sandbox --resource-group koder-sandbox --tail 100
```

### Roll back to Fly.io

The Fly.io configuration is preserved (`sandbox/fly.toml`):

```bash
cd sandbox && fly deploy
```

Then clear `SANDBOX_URL`/`PYTHON_SANDBOX_URL` on Render (or point them back at
`https://koder-sandbox.fly.dev`).

### Monitor cost

Azure Cost Management (Portal → Cost analysis) is free to view; monitor the
monthly always-warm cost (expect ~$18–22/mo at the 1-replica baseline) and
check the replica metric (`az containerapp show`) if usage surprises you.

---

## 10. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Deploy fails: image pull 401/denied | GHCR image is private, or not pushed yet | Confirm the image is public: `gh`/GitHub web → Packages → koder-sandbox → visibility. Build + push first (Step 1) |
| Deploy fails: 404 image not found | `:latest` never pushed | Push via the workflow (merge to `main`/`staging`) or manual `docker push` |
| `/health` never returns after deploy | Cold start > 300s, or container crashing | `az containerapp logs show ... --tail 100`; raise `HEALTH_TIMEOUT_SEC` in `deploy.sh` |
| `429 rate_limit_exceeded` from the backend | Exceeding 60/min per IP (or default 10) | Raise `RATE_LIMIT_PER_MIN` in `deploy.sh` / `SANDBOX_RATE_LIMIT_PER_MIN` env |
| Go compiles are slow | 0.5 vCPU too small | Raise `CPU` (e.g. `1.0`) in `deploy.sh`; re-run. Cost rises accordingly |
| Python/Go processes OOM | `1.0Gi` too small for concurrent runs | Raise `MEMORY` (e.g. `2.0Gi`); re-run. Cost rises accordingly |
| Stuck at 0 replicas, request hangs | Scale rule not applied / ingress broken | `az containerapp show ... --query properties.configuration.ingress`; re-run `deploy.sh` |
| `az containerapp` command not found | Extension missing | `az extension add --name containerapp` (deploy.sh does this automatically) |

---

## 11. Teardown

```bash
az group delete --name koder-sandbox --yes --no-wait   # deletes env + app together
```

Revert the backend to local Docker by clearing `SANDBOX_URL`/`PYTHON_SANDBOX_URL`.

To also remove the image, delete the `koder-sandbox` package on
`https://github.com/users/jerryjuche/packages/container/package/koder-sandbox`.

---

## 12. Quick Reference

```bash
# Preflight
az account show --query '{name:name,id:id}' -o json

# Image (auto) — merge to main/staging; or manual:
docker build -t ghcr.io/jerryjuche/koder-sandbox:latest ./sandbox
docker login ghcr.io -u <username> && docker push ghcr.io/jerryjuche/koder-sandbox:latest

# Deploy
./sandbox/azure/deploy.sh --dry-run
./sandbox/azure/deploy.sh

# Verify
curl -fsS https://koder-sandbox.ashysmoke-c753df92.westeurope.azurecontainerapps.io/health

# Backend env (Render)
SANDBOX_URL=https://koder-sandbox.ashysmoke-c753df92.westeurope.azurecontainerapps.io

# Rollback
cd sandbox && fly deploy            # restore Fly.io path
az group delete --name koder-sandbox --yes --no-wait
```
