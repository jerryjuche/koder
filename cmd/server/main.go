package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"syscall"
	"time"

	"github.com/jerryjuche/koder/internal/api"
	"github.com/jerryjuche/koder/internal/broker"
	"github.com/jerryjuche/koder/internal/config"
	"github.com/jerryjuche/koder/internal/executor"
	"github.com/jerryjuche/koder/internal/store"
)

var (
	commit  = "dev"
	buildAt = "unknown"
)

func main() {
	// Set up structured JSON logging for production observability
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	slog.Info("starting",
		"commit", commit,
		"build_at", buildAt,
		"go_version", runtime.Version(),
		"arch", runtime.GOARCH,
		"os", runtime.GOOS,
	)

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		slog.Error("failed to load configuration", "error", err)
		os.Exit(1)
	}

	// Create a context for startup operations
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Initialize database store
	storeInstance, err := store.NewPostgresStore(ctx, cfg.DatabaseURL)
	if err != nil {
		slog.Error("failed to connect to database", "error", err)
		os.Exit(1)
	}
	defer storeInstance.Close()

	slog.Info("database: connected", "environment", cfg.Environment)

	// Initialize Execution Engine
	execInstance := executor.NewExecutor(cfg, storeInstance)
	slog.Info("executor: initialized", "max_concurrency", cfg.ExecutorMaxConcurrency, "timeout_seconds", cfg.ExecutorTimeoutSeconds)

	if cfg.SandboxURL != "" {
		slog.Info("executor: using remote sandbox", "url", cfg.SandboxURL)
	} else {
		slog.Info("executor: using local Docker execution")
		go func() {
			warmupCtx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
			defer cancel()
			if err := execInstance.Warmup(warmupCtx); err != nil {
				slog.Warn("failed to completely warmup executor", "error", err)
			}
		}()
	}

	// Create HTTP router
	b := broker.New()
	slog.Info("broker: initialized")

	app, err := api.NewRouter(cfg, storeInstance, execInstance, b)
	if err != nil {
		slog.Error("failed to initialize router", "error", err)
		os.Exit(1)
	}

	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Port),
		Handler:      app.Handler,
		ReadTimeout:  60 * time.Second,
		WriteTimeout: 60 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		slog.Info("starting server", "port", cfg.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("server error", "error", err)
			os.Exit(1)
		}
	}()

	// Wait for graceful shutdown signal
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	sig := <-sigChan
	slog.Info("shutdown: received signal", "signal", sig)

	// Graceful shutdown with timeout
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		slog.Error("server shutdown error", "error", err)
	}

	// Stop background goroutines for rate limiters and caches
	app.Shutdown()

	slog.Info("server shutdown complete")
}
