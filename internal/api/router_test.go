package api

import (
	"strings"
	"testing"

	"github.com/jerryjuche/koder/internal/broker"
	"github.com/jerryjuche/koder/internal/config"
	"github.com/jerryjuche/koder/internal/executor"
	"github.com/jerryjuche/koder/internal/store"
)

// nilStore satisfies the store.Store interface with no-op implementations.
// NewRouter/NewAdminHandler only store the reference at construction time and
// never invoke methods on it, so an all-nil implementation is sufficient to
// exercise the route-registration path (the chi middleware-ordering panic).
type nilStore struct {
	store.Store
}

func TestNewRouter_DoesNotPanic(t *testing.T) {
	cfg := &config.Config{
		Environment:     "test",
		JWTSecret:       strings.Repeat("x", 32),
		FrontendURL:     "http://localhost:3000",
		EmailFrom:       "Koder <noreply@koder.sbs>",
		AccessTokenMinutes: 60,
		RefreshTokenDays: 7,
		SandboxBaseDir:   "/tmp/koder",
		Port:             8080,
	}
	// chi panics with "all middlewares must be defined before routes on a mux"
	// if any route is registered before r.Use() on the same mux. This test
	// guards the /auth/refresh route ordering specifically.
	app, err := NewRouter(cfg, &nilStore{}, (*executor.Executor)(nil), broker.New())
	if err != nil {
		t.Fatalf("NewRouter failed: %v", err)
	}
	if app == nil {
		t.Fatal("NewRouter returned nil app")
	}

	if app.Handler == nil {
		t.Fatal("app.Handler is nil")
	}
}
