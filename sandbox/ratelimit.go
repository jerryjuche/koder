package main

import (
	"fmt"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"
)

// RateLimiter implements a per-IP sliding window rate limiter.
// Zero-value is not usable; use NewRateLimiter to construct.
type RateLimiter struct {
	mu      sync.RWMutex
	entries map[string]*rateEntry
	maxReqs int
	window  time.Duration
	stopCh  chan struct{}
}

type rateEntry struct {
	count   int
	startAt time.Time
}

// NewRateLimiter creates a rate limiter allowing maxReqs requests per
// duration window per unique IP address. cleanupInterval controls how
// often stale entries are purged from memory (zero disables cleanup).
func NewRateLimiter(maxReqs int, window, cleanupInterval time.Duration) *RateLimiter {
	if maxReqs < 1 {
		maxReqs = 1
	}
	if window <= 0 {
		window = time.Minute
	}

	rl := &RateLimiter{
		entries: make(map[string]*rateEntry),
		maxReqs: maxReqs,
		window:  window,
		stopCh:  make(chan struct{}),
	}

	if cleanupInterval > 0 {
		go rl.cleanupLoop(cleanupInterval)
	}

	return rl
}

// Allow records a request from the given IP and returns whether it is
// within the rate limit. It returns the duration the caller should wait
// before retrying when the limit is exceeded.
func (rl *RateLimiter) Allow(ip string) (retryAfter time.Duration, allowed bool) {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	entry, exists := rl.entries[ip]

	if !exists || now.Sub(entry.startAt) >= rl.window {
		rl.entries[ip] = &rateEntry{count: 1, startAt: now}
		return 0, true
	}

	entry.count++
	if entry.count <= rl.maxReqs {
		return 0, true
	}

	retryAfter = rl.window - now.Sub(entry.startAt)
	return retryAfter, false
}

// Middleware wraps an http.Handler with per-IP rate limiting.
// It returns HTTP 429 with a JSON error body and Retry-After header
// when the caller exceeds the rate limit.
func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := extractIP(r)

		retryAfter, ok := rl.Allow(ip)
		if !ok {
			secs := int(retryAfter.Seconds()) + 1

			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("Retry-After", fmt.Sprintf("%d", secs))
			w.WriteHeader(http.StatusTooManyRequests)

			fmt.Fprintf(w, `{"error":"rate_limit_exceeded","retry_after_seconds":%d}`, secs)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Stop terminates the background cleanup goroutine. After Stop returns
// the RateLimiter must not be used.
func (rl *RateLimiter) Stop() {
	close(rl.stopCh)
}

func (rl *RateLimiter) cleanupLoop(interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			rl.purge()
		case <-rl.stopCh:
			return
		}
	}
}

func (rl *RateLimiter) purge() {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	threshold := time.Now().Add(-rl.window * 2)
	for ip, entry := range rl.entries {
		if entry.startAt.Before(threshold) {
			delete(rl.entries, ip)
		}
	}
}

// extractIP returns the client IP from the request, checking common
// proxy headers before falling back to RemoteAddr.
func extractIP(r *http.Request) string {
	// X-Forwarded-For: client, proxy1, proxy2
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.SplitN(xff, ",", 2)
		ip := strings.TrimSpace(parts[0])
		if net.ParseIP(ip) != nil {
			return ip
		}
	}

	// X-Real-IP: single client IP (set by nginx, Railway, etc.)
	if xri := r.Header.Get("X-Real-IP"); xri != "" {
		if net.ParseIP(xri) != nil {
			return xri
		}
	}

	// Strip port from RemoteAddr (format "ip:port")
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}
