FROM golang:1.26-alpine AS builder

WORKDIR /build
COPY go.mod ./
# No go.sum — sandbox has zero external dependencies
COPY *.go ./
ARG GIT_COMMIT=dev
RUN CGO_ENABLED=0 go build -ldflags="-X main.gitCommit=${GIT_COMMIT}" -o sandbox-runner .

FROM golang:1.26-alpine

RUN apk add --no-cache python3

WORKDIR /app
COPY --from=builder /build/sandbox-runner /usr/local/bin/

# Pre-warm the Go build cache (same flags/env the runner uses in runtest_go.go:
# -gcflags=-l, CGO_ENABLED=0, GOPROXY=off, GOTOOLCHAIN=local, GOFLAGS=-buildvcs=false)
# so the first test run on a cold container reuses the compiled stdlib/testing
# packages instead of spending ~20s recompiling them.
RUN mkdir -p /warmup && cd /warmup \
    && printf 'module koder-warmup\n\ngo 1.26\n' > go.mod \
    && printf 'package warmup\n' > warmup.go \
    && printf 'package warmup\n\nimport "testing"\n\nfunc TestWarmup(t *testing.T) {}\n' > warmup_test.go \
    && CGO_ENABLED=0 GOPROXY=off GOSUMDB=off GOTOOLCHAIN=local GOFLAGS=-buildvcs=false go test -count=1 -gcflags=-l ./... \
    && rm -rf /warmup

EXPOSE 8080

CMD ["sandbox-runner"]
