#!/usr/bin/env bash
# =============================================================================
# deploy.sh — Deploy the Koder code sandbox to Azure Container Apps
#
#   Image:   ghcr.io/jerryjuche/koder-sandbox (public — no credentials needed)
#   Cost:    $0 — ACA consumption billing, scale-to-zero at 0 replicas
#   Docs:    docs/azure-sandbox-deploy.md
#
# Usage:
#   ./deploy.sh [--dry-run] [--yes]
#
#   --dry-run   Print every command that would run without executing it.
#   --yes       Skip the confirmation prompt before applying changes.
#
# The script is idempotent: re-running it updates the app image/scale in place.
# =============================================================================
set -euo pipefail

# -----------------------------------------------------------------------------
# Configuration — edit to suit your environment
# -----------------------------------------------------------------------------
RESOURCE_GROUP="koder-sandbox"
LOCATION="westeurope"
ENVIRONMENT="sandbox-env"                 # Container Apps environment name
APP_NAME="koder-sandbox"                  # Container app name (URL subdomain)
IMAGE="ghcr.io/jerryjuche/koder-sandbox:latest"
TARGET_PORT=8080                          # Sandbox HTTP port (matches Dockerfile EXPOSE)

MIN_REPLICAS=0                            # 0 = scale-to-zero (cold start ~30-60s)
MAX_REPLICAS=4                            # Bounded to stay in the free allowance
CPU="0.5"                                 # vCPU per replica (consumption: 0.25-4.0)
MEMORY="1.0Gi"                            # RAM per replica (sandbox RLIMIT_AS 512MB)
HTTP_CONCURRENCY=50                       # Requests per replica before scaling out
RATE_LIMIT_PER_MIN=60                     # SANDBOX_RATE_LIMIT_PER_MIN (single backend IP)

HEALTH_TIMEOUT_SEC=300                    # Wait for /health after deploy before failing

# -----------------------------------------------------------------------------
# Argument parsing
# -----------------------------------------------------------------------------
DRY_RUN=false
ASSUME_YES=false

print_help() {
    sed -n '2,15p' "$0" | sed 's/^# \{0,1\}//'
    exit 0
}

for arg in "$@"; do
    case "$arg" in
        --dry-run) DRY_RUN=true ;;
        -y | --yes) ASSUME_YES=true ;;
        -h | --help) print_help ;;
        *)
            echo "error: unknown argument '$arg' (see ./deploy.sh --help)" >&2
            exit 1
            ;;
    esac
done

# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
GREEN=$'\033[32m'
YELLOW=$'\033[33m'
RED=$'\033[31m'
BOLD=$'\033[1m'
RESET=$'\033[0m'

info()  { printf '%s\n' "${GREEN}[info]${RESET} $*"; }
warn()  { printf '%s\n' "${YELLOW}[warn]${RESET} $*"; }
error() { printf '%s\n' "${RED}[error]${RESET} $*" >&2; }

confirm() {
    if $ASSUME_YES; then
        return 0
    fi
    printf '%s\n' "${BOLD}$*${RESET} [y/N] "
    read -r -n 1 reply
    printf '\n'
    [[ "$reply" == "y" || "$reply" == "Y" ]]
}

# run <cmd...> — execute a command, or echo it under --dry-run
run() {
    if $DRY_RUN; then
        printf '    ${YELLOW}DRY-RUN:${RESET} %q' "$1"
        shift
        for arg in "$@"; do printf ' %q' "$arg"; done
        printf '\n'
    else
        printf '    > '
        printf '%q ' "$@"
        printf '\n'
        "$@"
    fi
}

# -----------------------------------------------------------------------------
# Preflight: prerequisites and login
# -----------------------------------------------------------------------------
require_cmd() {
    if ! command -v "$1" >/dev/null 2>&1; then
        error "required command not found: $1"
        exit 1
    fi
}

require_cmd az
require_cmd curl

# Fail fast if not authenticated (also surfaces which subscription would be used)
SUB_NAME=$(az account show --query name -o tsv 2>/dev/null) || {
    error "not signed in to Azure. Run 'az login' first."
    exit 1
}
SUB_ID=$(az account show --query id -o tsv)
info "Azure subscription: ${BOLD}${SUB_NAME}${RESET} (${SUB_ID})"

if $DRY_RUN; then
    warn "dry-run mode — no Azure resources will be created or changed."
fi

# The containerapp command lives in an extension; install it if missing.
if ! az extension show --name containerapp -o tsv --query name >/dev/null 2>&1; then
    warn "installing 'containerapp' CLI extension..."
    run az extension add --name containerapp
fi

# -----------------------------------------------------------------------------
# Plan
# -----------------------------------------------------------------------------
echo
info "Deployment plan:"
printf '    Resource group : %s (%s)\n' "$RESOURCE_GROUP" "$LOCATION"
printf '    Environment    : %s (consumption)\n' "$ENVIRONMENT"
printf '    Container app  : %s\n' "$APP_NAME"
printf '    Image          : %s\n' "$IMAGE"
printf '    Scale          : min=%s max=%s  (http concurrency=%s)\n' \
    "$MIN_REPLICAS" "$MAX_REPLICAS" "$HTTP_CONCURRENCY"
printf '    Compute        : %s vCPU / %s per replica\n' "$CPU" "$MEMORY"
printf '    Env var        : SANDBOX_RATE_LIMIT_PER_MIN=%s\n' "$RATE_LIMIT_PER_MIN"
echo

if ! confirm "Continue and apply this deployment to Azure?"; then
    info "aborted by user."
    exit 0
fi

# -----------------------------------------------------------------------------
# 1. Resource group
# -----------------------------------------------------------------------------
if az group show -n "$RESOURCE_GROUP" -o tsv --query name >/dev/null 2>&1; then
    info "resource group '${RESOURCE_GROUP}' already exists."
else
    info "creating resource group '${RESOURCE_GROUP}'..."
    run az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --output none
fi

# -----------------------------------------------------------------------------
# 2. Container Apps environment (consumption billing, scale-to-zero capable)
# -----------------------------------------------------------------------------
if az containerapp env show -n "$ENVIRONMENT" -g "$RESOURCE_GROUP" -o tsv --query name >/dev/null 2>&1; then
    info "environment '${ENVIRONMENT}' already exists."
else
    info "creating Container Apps environment '${ENVIRONMENT}'..."
    run az containerapp env create \
        --name "$ENVIRONMENT" \
        --resource-group "$RESOURCE_GROUP" \
        --location "$LOCATION" \
        --output none
fi

# -----------------------------------------------------------------------------
# 3. Container app (create or update in place)
# -----------------------------------------------------------------------------
APP_EXISTS=false
if az containerapp show -n "$APP_NAME" -g "$RESOURCE_GROUP" -o tsv --query name >/dev/null 2>&1; then
    APP_EXISTS=true
fi

if $APP_EXISTS; then
    info "updating container app '${APP_NAME}' to image ${IMAGE}..."
    run az containerapp update \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --image "$IMAGE" \
        --cpu "$CPU" \
        --memory "$MEMORY" \
        --min-replicas "$MIN_REPLICAS" \
        --max-replicas "$MAX_REPLICAS" \
        --scale-rule-name http \
        --scale-rule-type http \
        --scale-rule-http-concurrency "$HTTP_CONCURRENCY" \
        --set-env-vars "SANDBOX_RATE_LIMIT_PER_MIN=$RATE_LIMIT_PER_MIN" \
        --output none
else
    info "creating container app '${APP_NAME}'..."
    run az containerapp create \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --environment "$ENVIRONMENT" \
        --image "$IMAGE" \
        --min-replicas "$MIN_REPLICAS" \
        --max-replicas "$MAX_REPLICAS" \
        --cpu "$CPU" \
        --memory "$MEMORY" \
        --ingress external \
        --target-port "$TARGET_PORT" \
        --scale-rule-name http \
        --scale-rule-type http \
        --scale-rule-http-concurrency "$HTTP_CONCURRENCY" \
        --env-vars "SANDBOX_RATE_LIMIT_PER_MIN=$RATE_LIMIT_PER_MIN" \
        --output none
fi

# -----------------------------------------------------------------------------
# 4. Health check
# -----------------------------------------------------------------------------
FQDN=$(az containerapp show -n "$APP_NAME" -g "$RESOURCE_GROUP" -o tsv --query properties.configuration.ingress.fqdn)
BASE_URL="https://${FQDN}"
echo
info "waiting for ${BOLD}${BASE_URL}${RESET}/health (up to ${HEALTH_TIMEOUT_SEC}s)..."

DEADLINE=$((SECONDS + HEALTH_TIMEOUT_SEC))
while :; do
    if curl -fsS --max-time 10 "${BASE_URL}/health" 2>/dev/null; then
        echo
        info "sandbox is healthy."
        break
    fi
    if (( SECONDS >= DEADLINE )); then
        error "timed out waiting for /health after ${HEALTH_TIMEOUT_SEC}s."
        error "check container logs: az containerapp logs show --name ${APP_NAME} --resource-group ${RESOURCE_GROUP}"
        exit 1
    fi
    printf '    waiting for cold start... (%ss elapsed)\n' "$SECONDS"
    sleep 10
done

# -----------------------------------------------------------------------------
# 5. Summary
# -----------------------------------------------------------------------------
echo
info "deployment complete."
printf '    Health URL  : %s/health\n' "$BASE_URL"
printf '    Version URL : %s/version\n' "$BASE_URL"
printf '    Execute URL : %s/execute\n' "$BASE_URL"
echo
printf '    Point the backend at it by setting:\n'
printf '      SANDBOX_URL=https://%s\n' "${FQDN}"
echo
info "teardown (when no longer needed):"
printf '    az group delete --name %s --yes --no-wait\n' "$RESOURCE_GROUP"
