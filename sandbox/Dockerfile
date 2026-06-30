FROM golang:1.23-alpine AS builder

WORKDIR /build
COPY go.mod ./
# No go.sum — sandbox has zero external dependencies
COPY *.go ./
RUN CGO_ENABLED=0 go build -o sandbox-runner .

FROM golang:1.23-alpine

WORKDIR /app
COPY --from=builder /build/sandbox-runner /usr/local/bin/

EXPOSE 8080

CMD ["sandbox-runner"]
