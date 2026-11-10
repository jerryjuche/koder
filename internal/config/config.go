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

	// AI Provider (nvidia-compatible — DeepSeek V4 Flash via NVIDIA NIM by default;
	// any OpenAI-compatible chat/completions endpoint works via AI_* aliases)
	EnrichmentProvider string

	// AI provider credentials. Generic AI_* aliases are preferred; the NVIDIA_*
	// vars remain as fallbacks. All of these can point at any OpenAI-compatible
	// chat/completions endpoint.
	NVIDIAAPIKey  string // source: AI_API_KEY or NVIDIA_API_KEY
	NVIDIAModel   string // source: AI_MODEL or NVIDIA_MODEL (default: deepseek-ai/deepseek-v4-flash)
	NVIDIABaseURL string // source: AI_BASE_URL or NVIDIA_BASE_URL (default: https://integrate.api.nvidia.com/v1)

	// AI provider knobs — tune per model without code changes.
	AIMaxTokens   int     // source: AI_MAX_TOKENS (default: 8192; e.g. 16384 for z-ai/glm-5.2)
	AITemperature float64 // source: AI_TEMPERATURE (default: 0.7; 0.2 for consistent code analysis)
	AIJSONMode    bool    // source: AI_JSON_MODE (default: false; sends response_format json_object)

	// Execution
	ExecutorMaxConcurrency int
	ExecutorTimeoutSeconds int
	DockerImage            string
	SandboxBaseDir         string
	BuildCacheDir          string
	SandboxURL             string // Optional — if set, use HTTP sandbox instead of Docker
	GoVersion              string // Go version directive for generated go.mod (default "1.26")

	// SandboxRequestTimeoutExtra is the number of seconds the HTTP client waits
	// beyond the execution timeout for a remote sandbox response. It tolerates
	// scale-to-zero cold starts (Azure Container Apps) without extending the
	// student code run limit. Default: 20.
	SandboxRequestTimeoutExtra int

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

	// CORS (comma-separated origins, e.g. "https://koder.sbs,https://www.koder.sbs,http://localhost:3000")
	// Reads from ALLOWED_ORIGINS (preferred) or ALLOWED_ORIGIN (legacy).
	AllowedOrigin string

	// Google OAuth2
	GoogleClientID string

	// Notifications
	ResendAPIKey string
	EmailFrom    string // sender address for transactional emails

	// ResendWebhookSecret verifies incoming Resend webhook requests
	// (svix-style HMAC over svix-id/svix-timestamp/payload). Optional — when
	// unset the webhook endpoint responds 503 and delivery events are ignored.
	ResendWebhookSecret string

	// Frontend URL for reset links
	FrontendURL string

	// Admin
	AdminEmail    string
	AdminPassword string
}

// firstEnv returns the value of the first environment variable that is set
// (non-empty), or "" if none are set. Used for config aliases such as
// AI_API_KEY falling back to NVIDIA_API_KEY.
func firstEnv(names ...string) string {
	for _, n := range names {
		if v := os.Getenv(n); v != "" {
			return v
		}
	}
	return ""
}

// firstEnvName returns the name of the first environment variable that is set,
// or "" if none are. Used for logging which alias supplied the value.
func firstEnvName(names ...string) string {
	for _, n := range names {
		if os.Getenv(n) != "" {
			return n
		}
	}
	return ""
}

// envBool parses a boolean environment variable. Accepts "1", "true", "yes",
// "on" (case-insensitive) as true; anything else is false.
func envBool(name string) bool {
	switch strings.ToLower(strings.TrimSpace(os.Getenv(name))) {
	case "1", "true", "yes", "on":
		return true
	default:
		return false
	}
}

func loadEnvFile() {
	if strings.HasSuffix(os.Args[0], ".test") {
		return
	}
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
		accessTokenMinutesStr = "60"
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

	// AI Provider Selection — DeepSeek V4 Flash via NVIDIA NIM (or any
	// OpenAI-compatible endpoint). Generic AI_* env vars take priority over the
	// legacy NVIDIA_* names so you can plug in a different provider token
	// without changing code.
	cfg.EnrichmentProvider = os.Getenv("ENRICHMENT_PROVIDER")
	if cfg.EnrichmentProvider == "" {
		cfg.EnrichmentProvider = "nvidia"
	}
	cfg.NVIDIAAPIKey = firstEnv("AI_API_KEY", "NVIDIA_API_KEY")

	if cfg.EnrichmentProvider != "nvidia" {
		return nil, fmt.Errorf("ENRICHMENT_PROVIDER must be 'nvidia', got %q", cfg.EnrichmentProvider)
	}
	if cfg.NVIDIAAPIKey == "" {
		return nil, fmt.Errorf("AI_API_KEY (or NVIDIA_API_KEY) is required for the AI provider")
	}

	cfg.NVIDIAModel = firstEnv("AI_MODEL", "NVIDIA_MODEL")
	if cfg.NVIDIAModel == "" {
		cfg.NVIDIAModel = "deepseek-ai/deepseek-v4-flash"
	}

	cfg.NVIDIABaseURL = firstEnv("AI_BASE_URL", "NVIDIA_BASE_URL")
	if cfg.NVIDIABaseURL == "" {
		cfg.NVIDIABaseURL = "https://integrate.api.nvidia.com/v1"
	}

	// Provider knobs (AI_MAX_TOKENS / AI_TEMPERATURE / AI_JSON_MODE)
	aiMaxTokensStr := os.Getenv("AI_MAX_TOKENS")
	if aiMaxTokensStr == "" {
		cfg.AIMaxTokens = 8192
	} else {
		aiMaxTokens, err := strconv.Atoi(aiMaxTokensStr)
		if err != nil || aiMaxTokens <= 0 {
			return nil, fmt.Errorf("AI_MAX_TOKENS must be a positive integer, got %q", aiMaxTokensStr)
		}
		cfg.AIMaxTokens = aiMaxTokens
	}

	aiTempStr := os.Getenv("AI_TEMPERATURE")
	if aiTempStr == "" {
		cfg.AITemperature = 0.7
	} else {
		aiTemp, err := strconv.ParseFloat(aiTempStr, 64)
		if err != nil || aiTemp < 0 || aiTemp > 2 {
			return nil, fmt.Errorf("AI_TEMPERATURE must be a number in [0, 2], got %q", aiTempStr)
		}
		cfg.AITemperature = aiTemp
	}

	cfg.AIJSONMode = envBool("AI_JSON_MODE")

	slog.Info("config: using AI provider",
		"provider", cfg.EnrichmentProvider,
		"model", cfg.NVIDIAModel,
		"base_url", cfg.NVIDIABaseURL,
		"key_source", firstEnvName("AI_API_KEY", "NVIDIA_API_KEY"),
		"max_tokens", cfg.AIMaxTokens,
		"temperature", cfg.AITemperature,
		"json_mode", cfg.AIJSONMode)

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
		cfg.DockerImage = "golang:1.26-alpine"
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

	sandboxTimeoutExtraStr := os.Getenv("SANDBOX_REQUEST_TIMEOUT_EXTRA_SECONDS")
	if sandboxTimeoutExtraStr == "" {
		sandboxTimeoutExtraStr = "20"
	}
	sandboxTimeoutExtra, err := strconv.Atoi(sandboxTimeoutExtraStr)
	if err != nil || sandboxTimeoutExtra < 0 {
		return nil, fmt.Errorf("SANDBOX_REQUEST_TIMEOUT_EXTRA_SECONDS must be a non-negative integer: %q", sandboxTimeoutExtraStr)
	}
	cfg.SandboxRequestTimeoutExtra = sandboxTimeoutExtra

	cfg.GoVersion = os.Getenv("GO_VERSION")
	if cfg.GoVersion == "" {
		cfg.GoVersion = "1.26"
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

	// CORS — ALLOWED_ORIGINS (plural) preferred, ALLOWED_ORIGIN (singular) for backward compat.
	// In production, this MUST be explicitly set to your frontend domain(s).
	cfg.AllowedOrigin = os.Getenv("ALLOWED_ORIGINS")
	if cfg.AllowedOrigin == "" {
		cfg.AllowedOrigin = os.Getenv("ALLOWED_ORIGIN")
		if cfg.AllowedOrigin != "" {
			slog.Warn("config: ALLOWED_ORIGIN is deprecated, use ALLOWED_ORIGINS (plural)")
		}
	}
	if cfg.AllowedOrigin == "" {
		cfg.AllowedOrigin = "https://koder.sbs,https://www.koder.sbs,http://localhost:3000"
	}

	// Google OAuth2
	cfg.GoogleClientID = os.Getenv("GOOGLE_CLIENT_ID")

	// Email sender address for transactional emails (Resend)
	cfg.ResendAPIKey = os.Getenv("RESEND_API_KEY")
	cfg.EmailFrom = os.Getenv("EMAIL_FROM")
	if cfg.EmailFrom == "" {
		cfg.EmailFrom = "Koder <noreply@koder.sbs>"
	}

	// Signing secret for Resend webhook signature verification (optional)
	cfg.ResendWebhookSecret = os.Getenv("RESEND_WEBHOOK_SECRET")

	// Frontend URL (used for password reset links, CORS, etc.)
	// In production, this MUST be explicitly set to your frontend domain.
	cfg.FrontendURL = os.Getenv("FRONTEND_URL")
	if cfg.FrontendURL == "" {
		if cfg.Environment == "production" {
			slog.Warn("config: FRONTEND_URL not set in production — password reset links will be broken")
		}
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
