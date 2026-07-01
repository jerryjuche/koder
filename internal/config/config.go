package config

import (
	"bufio"
	"fmt"
	"log/slog"
	"os"
	"strconv"
	"strings"
	"time"
)

// Config holds all application configuration loaded from environment variables.
type Config struct {
	// Database
	DatabaseURL string

	// Auth
	JWTSecret      string
	JWTExpiryHours int

	// AI Provider (gemini or groq)
	EnrichmentProvider string

	// Gemini
	GeminiAPIKey string
	GeminiModel  string

	// Groq
	GroqAPIKey string
	GroqModel  string

	// Execution
	ExecutorMaxConcurrency int
	ExecutorTimeoutSeconds int
	DockerImage            string
	SandboxBaseDir         string
	BuildCacheDir          string
	SandboxURL             string // Optional — if set, use HTTP sandbox instead of Docker
	GoVersion              string // Go version directive for generated go.mod (default "1.23")

	// Server
	Port        int
	Environment string

	// CORS
	AllowedOrigin string

	// Google OAuth2
	GoogleClientID string

	// Admin
	AdminEmail    string
	AdminPassword string
}

func loadEnvFile() {
	file, err := os.Open(".env")
	if err != nil {
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}
		key := strings.TrimSpace(parts[0])
		val := strings.TrimSpace(parts[1])
		if os.Getenv(key) == "" {
			os.Setenv(key, val)
		}
	}
	if err := scanner.Err(); err != nil {
		fmt.Fprintf(os.Stderr, "warning: error reading .env file: %v\n", err)
	}
}

// Load reads all environment variables and validates them.
// Fails fast with clear error messages if required variables are missing.
func Load() (*Config, error) {
	loadEnvFile()
	cfg := &Config{}

	// Database
	cfg.DatabaseURL = os.Getenv("DATABASE_URL")
	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}

	// Auth
	cfg.JWTSecret = os.Getenv("JWT_SECRET")
	if cfg.JWTSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET is required")
	}
	if len(cfg.JWTSecret) < 32 {
		return nil, fmt.Errorf("JWT_SECRET must be at least 32 characters long")
	}

	jwtExpiryStr := os.Getenv("JWT_EXPIRY_HOURS")
	if jwtExpiryStr == "" {
		jwtExpiryStr = "24"
	}
	jwtExpiry, err := strconv.Atoi(jwtExpiryStr)
	if err != nil {
		return nil, fmt.Errorf("JWT_EXPIRY_HOURS must be a valid integer: %w", err)
	}
	cfg.JWTExpiryHours = jwtExpiry

	// AI Provider Selection
	cfg.EnrichmentProvider = os.Getenv("ENRICHMENT_PROVIDER")
	cfg.GroqAPIKey = os.Getenv("GROQ_API_KEY")

	if cfg.EnrichmentProvider == "" {
		if cfg.GroqAPIKey != "" {
			cfg.EnrichmentProvider = "groq"
		} else {
			cfg.EnrichmentProvider = "gemini"
		}
	}

	cfg.GroqModel = os.Getenv("GROQ_MODEL")
	if cfg.GroqModel == "" {
		cfg.GroqModel = "llama-3.3-70b-versatile"
	}

	cfg.GeminiAPIKey = os.Getenv("GEMINI_API_KEY")
	cfg.GeminiModel = os.Getenv("GEMINI_MODEL")
	if cfg.GeminiModel == "" {
		cfg.GeminiModel = "gemini-2.5-pro"
	}

	switch cfg.EnrichmentProvider {
	case "gemini":
		if cfg.GeminiAPIKey == "" {
			return nil, fmt.Errorf("GEMINI_API_KEY is required when ENRICHMENT_PROVIDER is gemini")
		}
		slog.Info("config: using Gemini for problem enrichment", "model", cfg.GeminiModel)
	case "groq":
		if cfg.GroqAPIKey == "" {
			return nil, fmt.Errorf("GROQ_API_KEY is required when ENRICHMENT_PROVIDER is groq")
		}
		slog.Info("config: using Groq for problem enrichment", "model", cfg.GroqModel)
	default:
		return nil, fmt.Errorf("ENRICHMENT_PROVIDER must be 'gemini' or 'groq', got %q", cfg.EnrichmentProvider)
	}

	// Execution
	executorMaxConcurrencyStr := os.Getenv("EXECUTOR_MAX_CONCURRENCY")
	if executorMaxConcurrencyStr == "" {
		executorMaxConcurrencyStr = "6"
	}
	executorMaxConcurrency, err := strconv.Atoi(executorMaxConcurrencyStr)
	if err != nil {
		return nil, fmt.Errorf("EXECUTOR_MAX_CONCURRENCY must be a valid integer: %w", err)
	}
	if executorMaxConcurrency <= 0 {
		return nil, fmt.Errorf("EXECUTOR_MAX_CONCURRENCY must be > 0")
	}
	cfg.ExecutorMaxConcurrency = executorMaxConcurrency

	executorTimeoutStr := os.Getenv("EXECUTOR_TIMEOUT_SECONDS")
	if executorTimeoutStr == "" {
		executorTimeoutStr = "30"
	}
	executorTimeout, err := strconv.Atoi(executorTimeoutStr)
	if err != nil {
		return nil, fmt.Errorf("EXECUTOR_TIMEOUT_SECONDS must be a valid integer: %w", err)
	}
	if executorTimeout <= 0 {
		return nil, fmt.Errorf("EXECUTOR_TIMEOUT_SECONDS must be > 0")
	}
	cfg.ExecutorTimeoutSeconds = executorTimeout

	cfg.DockerImage = os.Getenv("DOCKER_IMAGE")
	if cfg.DockerImage == "" {
		cfg.DockerImage = "golang:1.23-alpine"
	}

	cfg.SandboxBaseDir = os.Getenv("SANDBOX_BASE_DIR")
	if cfg.SandboxBaseDir == "" {
		cfg.SandboxBaseDir = "/tmp/koder"
	}

	cfg.BuildCacheDir = os.Getenv("BUILD_CACHE_DIR")
	if cfg.BuildCacheDir == "" {
		cfg.BuildCacheDir = "/tmp/go-build-cache"
	}

	cfg.SandboxURL = os.Getenv("SANDBOX_URL")
	// Empty SANDBOX_URL means use local Docker (default behavior)

	cfg.GoVersion = os.Getenv("GO_VERSION")
	if cfg.GoVersion == "" {
		cfg.GoVersion = "1.23"
	}

	// Server
	portStr := os.Getenv("PORT")
	if portStr == "" {
		portStr = "8080"
	}
	port, err := strconv.Atoi(portStr)
	if err != nil {
		return nil, fmt.Errorf("PORT must be a valid integer: %w", err)
	}
	if port <= 0 || port > 65535 {
		return nil, fmt.Errorf("PORT must be between 1 and 65535")
	}
	cfg.Port = port

	cfg.Environment = os.Getenv("ENVIRONMENT")
	if cfg.Environment == "" {
		cfg.Environment = "development"
	}
	if cfg.Environment != "development" && cfg.Environment != "production" {
		return nil, fmt.Errorf("ENVIRONMENT must be 'development' or 'production'")
	}

	// CORS
	cfg.AllowedOrigin = os.Getenv("ALLOWED_ORIGIN")
	if cfg.AllowedOrigin == "" {
		cfg.AllowedOrigin = "http://localhost:3000"
	}

	// Google OAuth2
	cfg.GoogleClientID = os.Getenv("GOOGLE_CLIENT_ID")

	// Admin Credentials
	cfg.AdminEmail = os.Getenv("ADMIN_EMAIL")
	cfg.AdminPassword = os.Getenv("ADMIN_PASSWORD")

	return cfg, nil
}

// ExecutorTimeout returns the executor timeout as a time.Duration.
func (c *Config) ExecutorTimeout() time.Duration {
	return time.Duration(c.ExecutorTimeoutSeconds) * time.Second
}

// JWTExpiry returns the JWT expiry as a time.Duration.
func (c *Config) JWTExpiry() time.Duration {
	return time.Duration(c.JWTExpiryHours) * time.Hour
}
