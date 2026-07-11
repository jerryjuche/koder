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
	JWTSecret         string
	JWTExpiryHours    int
	AccessTokenMinutes int
	RefreshTokenDays   int

	// AI Provider (nvidia — DeepSeek V4 Flash via NVIDIA NIM)
	EnrichmentProvider string

	// NVIDIA NIM (DeepSeek V4 Flash)
	NVIDIAAPIKey string

	// Execution
	ExecutorMaxConcurrency int
	ExecutorTimeoutSeconds int
	DockerImage            string
	SandboxBaseDir         string
	BuildCacheDir          string
	SandboxURL             string // Optional — if set, use HTTP sandbox instead of Docker
	GoVersion              string // Go version directive for generated go.mod (default "1.23")

	// Python execution
	PythonDockerImage     string // default: "python:3.12-slim"
	PythonExecutorTimeout int    // default: 60
	PythonSandboxURL      string // optional separate Python sandbox

	// Build info (set via ldflags at build time)
	BuildCommit string
	BuildTime   string

	// Server
	Port        int
	Environment string

	// CORS
	AllowedOrigin string

	// Google OAuth2
	GoogleClientID string

	// Notifications
	ResendAPIKey string

	// Frontend URL for reset links
	FrontendURL string

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

	accessTokenMinutesStr := os.Getenv("ACCESS_TOKEN_EXPIRY_MINUTES")
	if accessTokenMinutesStr == "" {
		accessTokenMinutesStr = "15"
	}
	accessTokenMinutes, err := strconv.Atoi(accessTokenMinutesStr)
	if err != nil {
		return nil, fmt.Errorf("ACCESS_TOKEN_EXPIRY_MINUTES must be a valid integer: %w", err)
	}
	if accessTokenMinutes <= 0 {
		return nil, fmt.Errorf("ACCESS_TOKEN_EXPIRY_MINUTES must be > 0")
	}
	cfg.AccessTokenMinutes = accessTokenMinutes

	refreshTokenDaysStr := os.Getenv("REFRESH_TOKEN_EXPIRY_DAYS")
	if refreshTokenDaysStr == "" {
		refreshTokenDaysStr = "7"
	}
	refreshTokenDays, err := strconv.Atoi(refreshTokenDaysStr)
	if err != nil {
		return nil, fmt.Errorf("REFRESH_TOKEN_EXPIRY_DAYS must be a valid integer: %w", err)
	}
	if refreshTokenDays <= 0 {
		return nil, fmt.Errorf("REFRESH_TOKEN_EXPIRY_DAYS must be > 0")
	}
	cfg.RefreshTokenDays = refreshTokenDays

	// AI Provider Selection — DeepSeek V4 Flash via NVIDIA NIM
	cfg.EnrichmentProvider = os.Getenv("ENRICHMENT_PROVIDER")
	if cfg.EnrichmentProvider == "" {
		cfg.EnrichmentProvider = "nvidia"
	}
	cfg.NVIDIAAPIKey = os.Getenv("NVIDIA_API_KEY")

	if cfg.EnrichmentProvider != "nvidia" {
		return nil, fmt.Errorf("ENRICHMENT_PROVIDER must be 'nvidia', got %q", cfg.EnrichmentProvider)
	}
	if cfg.NVIDIAAPIKey == "" {
		return nil, fmt.Errorf("NVIDIA_API_KEY is required for DeepSeek V4 Flash via NVIDIA NIM")
	}
	slog.Info("config: using NVIDIA NIM (DeepSeek V4 Flash) for problem enrichment")

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

	// Python execution
	cfg.PythonDockerImage = os.Getenv("PYTHON_DOCKER_IMAGE")
	if cfg.PythonDockerImage == "" {
		cfg.PythonDockerImage = "python:3.12-slim"
	}

	pythonTimeoutStr := os.Getenv("PYTHON_EXECUTOR_TIMEOUT_SECONDS")
	if pythonTimeoutStr == "" {
		pythonTimeoutStr = "60"
	}
	pythonTimeout, err := strconv.Atoi(pythonTimeoutStr)
	if err != nil {
		return nil, fmt.Errorf("PYTHON_EXECUTOR_TIMEOUT_SECONDS must be a valid integer: %w", err)
	}
	cfg.PythonExecutorTimeout = pythonTimeout

	cfg.PythonSandboxURL = os.Getenv("PYTHON_SANDBOX_URL")

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

	cfg.BuildCommit = os.Getenv("BUILD_COMMIT")
	if cfg.BuildCommit == "" {
		cfg.BuildCommit = "dev"
	}

	cfg.BuildTime = os.Getenv("BUILD_TIME")
	if cfg.BuildTime == "" {
		cfg.BuildTime = "unknown"
	}

	cfg.Environment = os.Getenv("ENVIRONMENT")
	if cfg.Environment == "" {
		cfg.Environment = "development"
	}
	if cfg.Environment != "development" && cfg.Environment != "production" {
		return nil, fmt.Errorf("ENVIRONMENT must be 'development' or 'production'")
	}

	// CORS (comma-separated for multiple origins, e.g. "http://localhost:3000,https://koder.app")
	cfg.AllowedOrigin = os.Getenv("ALLOWED_ORIGIN")
	if cfg.AllowedOrigin == "" {
		cfg.AllowedOrigin = "http://localhost:3000"
	}

	// Google OAuth2
	cfg.GoogleClientID = os.Getenv("GOOGLE_CLIENT_ID")

	// Notifications
	cfg.ResendAPIKey = os.Getenv("RESEND_API_KEY")

	// Frontend URL
	cfg.FrontendURL = os.Getenv("FRONTEND_URL")
	if cfg.FrontendURL == "" {
		cfg.FrontendURL = "http://localhost:3000"
	}

	// Admin Credentials
	cfg.AdminEmail = os.Getenv("ADMIN_EMAIL")
	cfg.AdminPassword = os.Getenv("ADMIN_PASSWORD")

	return cfg, nil
}

// ExecutorTimeout returns the executor timeout as a time.Duration.
func (c *Config) ExecutorTimeout() time.Duration {
	return time.Duration(c.ExecutorTimeoutSeconds) * time.Second
}

// PythonTimeout returns the Python executor timeout as a time.Duration.
func (c *Config) PythonTimeout() time.Duration {
	return time.Duration(c.PythonExecutorTimeout) * time.Second
}

// JWTExpiry returns the JWT expiry as a time.Duration.
func (c *Config) JWTExpiry() time.Duration {
	return time.Duration(c.JWTExpiryHours) * time.Hour
}

// AccessTokenExpiry returns the access token expiry as a time.Duration.
func (c *Config) AccessTokenExpiry() time.Duration {
	return time.Duration(c.AccessTokenMinutes) * time.Minute
}

// RefreshTokenExpiry returns the refresh token expiry as a time.Duration.
func (c *Config) RefreshTokenExpiry() time.Duration {
	return time.Duration(c.RefreshTokenDays) * (24 * time.Hour)
}
