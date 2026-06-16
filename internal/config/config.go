package config

import (
	"bufio"
	"fmt"
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

	// Gemini
	GeminiAPIKey string
	GeminiModel  string

	// Execution
	ExecutorMaxConcurrency int
	ExecutorTimeoutSeconds int
	DockerImage            string
	SandboxBaseDir         string
	BuildCacheDir          string

	// Server
	Port        int
	Environment string

	// CORS
	AllowedOrigin string
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

	// Gemini
	cfg.GeminiAPIKey = os.Getenv("GEMINI_API_KEY")
	if cfg.GeminiAPIKey == "" {
		return nil, fmt.Errorf("GEMINI_API_KEY is required")
	}

	cfg.GeminiModel = os.Getenv("GEMINI_MODEL")
	if cfg.GeminiModel == "" {
		cfg.GeminiModel = "gemini-2.5-pro"
	}

	// Execution
	executorMaxConcurrencyStr := os.Getenv("EXECUTOR_MAX_CONCURRENCY")
	if executorMaxConcurrencyStr == "" {
		executorMaxConcurrencyStr = "2"
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
		executorTimeoutStr = "5"
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
		cfg.DockerImage = "golang:1.22-alpine"
	}

	cfg.SandboxBaseDir = os.Getenv("SANDBOX_BASE_DIR")
	if cfg.SandboxBaseDir == "" {
		cfg.SandboxBaseDir = "/tmp/koder"
	}

	cfg.BuildCacheDir = os.Getenv("BUILD_CACHE_DIR")
	if cfg.BuildCacheDir == "" {
		cfg.BuildCacheDir = "/tmp/go-build-cache"
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
