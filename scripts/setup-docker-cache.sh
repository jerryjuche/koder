#!/bin/sh
# Pre-warms the Go build cache for faster Docker-based grading.
# Only needed when SANDBOX_URL is empty (local Docker mode).
mkdir -p /tmp/go-build-cache
docker run --rm \
  -v /tmp/go-build-cache:/root/.cache/go-build \
  golang:1.23-alpine \
  go build std
