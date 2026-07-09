#!/bin/bash
set -euo pipefail

echo "=== Koder Build Script ==="

# Backend
echo "--- Building backend (linux/amd64) ---"
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o koder ./cmd/server

# Sandbox
echo "--- Building sandbox (linux/amd64) ---"
(cd sandbox && CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o sandbox-runner .)

echo "=== Build complete ==="
ls -lh koder sandbox/sandbox-runner
