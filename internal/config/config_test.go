package config

import (
	"testing"
	"time"
)

func requiredEnvVars(t *testing.T) {
	t.Helper()
	t.Setenv("DATABASE_URL", "postgres://user:pass@localhost/db")
	t.Setenv("JWT_SECRET", "this-is-a-very-long-secret-string-of-at-least-32-chars")
	t.Setenv("NVIDIA_API_KEY", "test-api-key")
}

func TestLoadConfig_Success(t *testing.T) {
	requiredEnvVars(t)

	cfg, err := Load()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if cfg.DatabaseURL != "postgres://user:pass@localhost/db" {
		t.Errorf("expected DATABASE_URL to be set, got %s", cfg.DatabaseURL)
	}
	if cfg.Port != 8080 {
		t.Errorf("expected port 8080, got %d", cfg.Port)
	}
}

func TestLoadConfig_MissingDatabaseURL(t *testing.T) {
	t.Setenv("DATABASE_URL", "")

	_, err := Load()
	if err == nil {
		t.Fatal("expected error for missing DATABASE_URL")
	}
	if err.Error() != "DATABASE_URL is required" {
		t.Errorf("expected DATABASE_URL is required, got %v", err)
	}
}

func TestLoadConfig_MissingJWTSecret(t *testing.T) {
	t.Setenv("DATABASE_URL", "postgres://user:pass@localhost/db")
	t.Setenv("JWT_SECRET", "")

	_, err := Load()
	if err == nil {
		t.Fatal("expected error for missing JWT_SECRET")
	}
	if err.Error() != "JWT_SECRET is required" {
		t.Errorf("expected JWT_SECRET is required, got %v", err)
	}
}

func TestLoadConfig_JWTSecretTooShort(t *testing.T) {
	t.Setenv("DATABASE_URL", "postgres://user:pass@localhost/db")
	t.Setenv("JWT_SECRET", "short")

	_, err := Load()
	if err == nil {
		t.Fatal("expected error for short JWT_SECRET")
	}
}

func TestLoadConfig_InvalidPort(t *testing.T) {
	requiredEnvVars(t)
	t.Setenv("PORT", "invalid")

	_, err := Load()
	if err == nil {
		t.Fatal("expected error for invalid PORT")
	}
}

func TestLoadConfig_PortOutOfRange(t *testing.T) {
	requiredEnvVars(t)
	t.Setenv("PORT", "0")

	_, err := Load()
	if err == nil {
		t.Fatal("expected error for PORT=0")
	}
}

func TestLoadConfig_InvalidEnvironment(t *testing.T) {
	requiredEnvVars(t)
	t.Setenv("ENVIRONMENT", "staging")

	_, err := Load()
	if err == nil {
		t.Fatal("expected error for ENVIRONMENT=staging")
	}
}

func TestLoadConfig_Defaults(t *testing.T) {
	requiredEnvVars(t)
	t.Setenv("GO_VERSION", "")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if cfg.Port != 8080 {
		t.Errorf("expected default port 8080, got %d", cfg.Port)
	}
	if cfg.ExecutorMaxConcurrency != 6 {
		t.Errorf("expected default concurrency 6, got %d", cfg.ExecutorMaxConcurrency)
	}
	if cfg.ExecutorTimeoutSeconds != 30 {
		t.Errorf("expected default timeout 30, got %d", cfg.ExecutorTimeoutSeconds)
	}
	if cfg.SandboxRequestTimeoutExtra != 20 {
		t.Errorf("expected default SandboxRequestTimeoutExtra 20, got %d", cfg.SandboxRequestTimeoutExtra)
	}
	if cfg.DockerImage != "golang:1.26-alpine" {
		t.Errorf("expected default DockerImage golang:1.26-alpine, got %s", cfg.DockerImage)
	}
	if cfg.PythonDockerImage != "python:3.12-slim" {
		t.Errorf("expected default PythonDockerImage python:3.12-slim, got %s", cfg.PythonDockerImage)
	}
	if cfg.PythonExecutorTimeout != 60 {
		t.Errorf("expected default PythonExecutorTimeout 60, got %d", cfg.PythonExecutorTimeout)
	}
	if cfg.GoVersion != "1.26" {
		t.Errorf("expected default GoVersion 1.26, got %s", cfg.GoVersion)
	}
	if cfg.SandboxBaseDir != "/tmp/koder" {
		t.Errorf("expected default SandboxBaseDir /tmp/koder, got %s", cfg.SandboxBaseDir)
	}
	if cfg.BuildCacheDir != "/tmp/go-build-cache" {
		t.Errorf("expected default BuildCacheDir /tmp/go-build-cache, got %s", cfg.BuildCacheDir)
	}
	if cfg.Environment != "development" {
		t.Errorf("expected default environment development, got %s", cfg.Environment)
	}
	if cfg.JWTExpiryHours != 24 {
		t.Errorf("expected default JWTExpiryHours 24, got %d", cfg.JWTExpiryHours)
	}
	if cfg.AccessTokenMinutes != 60 {
		t.Errorf("expected default AccessTokenMinutes 60, got %d", cfg.AccessTokenMinutes)
	}
	if cfg.RefreshTokenDays != 7 {
		t.Errorf("expected default RefreshTokenDays 7, got %d", cfg.RefreshTokenDays)
	}
	if cfg.BuildCommit != "dev" {
		t.Errorf("expected default BuildCommit dev, got %s", cfg.BuildCommit)
	}
	if cfg.BuildTime != "unknown" {
		t.Errorf("expected default BuildTime unknown, got %s", cfg.BuildTime)
	}
}

func TestLoadConfig_NvidiaDefaults(t *testing.T) {
	requiredEnvVars(t)

	cfg, err := Load()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if cfg.NVIDIAModel != "deepseek-ai/deepseek-v4-flash" {
		t.Errorf("expected default NVIDIAModel deepseek-ai/deepseek-v4-flash, got %s", cfg.NVIDIAModel)
	}
	if cfg.NVIDIABaseURL != "https://integrate.api.nvidia.com/v1" {
		t.Errorf("expected default NVIDIABaseURL https://integrate.api.nvidia.com/v1, got %s", cfg.NVIDIABaseURL)
	}
}

func TestLoadConfig_NvidiaCustomValues(t *testing.T) {
	requiredEnvVars(t)
	t.Setenv("NVIDIA_MODEL", "custom-model")
	t.Setenv("NVIDIA_BASE_URL", "https://custom.nvidia.com/v1")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if cfg.NVIDIAModel != "custom-model" {
		t.Errorf("expected custom NVIDIAModel, got %s", cfg.NVIDIAModel)
	}
	if cfg.NVIDIABaseURL != "https://custom.nvidia.com/v1" {
		t.Errorf("expected custom NVIDIABaseURL, got %s", cfg.NVIDIABaseURL)
	}
}

func TestLoadConfig_AIAliasesOverrideNvidia(t *testing.T) {
	requiredEnvVars(t)
	t.Setenv("AI_API_KEY", "my-custom-key")
	t.Setenv("AI_MODEL", "org/custom-model")
	t.Setenv("AI_BASE_URL", "https://custom.ai.example/v1")
	// NVIDIA_* are still set by requiredEnvVars — the AI_* aliases must win.
	t.Setenv("NVIDIA_MODEL", "should-not-win")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if cfg.NVIDIAAPIKey != "my-custom-key" {
		t.Errorf("expected AI_API_KEY to win, got %s", cfg.NVIDIAAPIKey)
	}
	if cfg.NVIDIAModel != "org/custom-model" {
		t.Errorf("expected AI_MODEL to win, got %s", cfg.NVIDIAModel)
	}
	if cfg.NVIDIABaseURL != "https://custom.ai.example/v1" {
		t.Errorf("expected AI_BASE_URL to win, got %s", cfg.NVIDIABaseURL)
	}
}

func TestLoadConfig_AIKeyAliasOnly(t *testing.T) {
	t.Setenv("DATABASE_URL", "postgres://user:pass@localhost/db")
	t.Setenv("JWT_SECRET", "this-is-a-very-long-secret-string-of-at-least-32-chars")
	t.Setenv("NVIDIA_API_KEY", "")
	t.Setenv("AI_API_KEY", "custom-key-only")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("expected no error with only AI_API_KEY, got %v", err)
	}
	if cfg.NVIDIAAPIKey != "custom-key-only" {
		t.Errorf("expected NVIDIAAPIKey from AI_API_KEY, got %s", cfg.NVIDIAAPIKey)
	}
}

func TestLoadConfig_AIKnobDefaults(t *testing.T) {
	requiredEnvVars(t)

	cfg, err := Load()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if cfg.AIMaxTokens != 8192 {
		t.Errorf("expected default AIMaxTokens 8192, got %d", cfg.AIMaxTokens)
	}
	if cfg.AITemperature != 0.7 {
		t.Errorf("expected default AITemperature 0.7, got %v", cfg.AITemperature)
	}
	if cfg.AIJSONMode {
		t.Error("expected default AIJSONMode false")
	}
}

func TestLoadConfig_AIKnobCustomValues(t *testing.T) {
	requiredEnvVars(t)
	t.Setenv("AI_MAX_TOKENS", "16384")
	t.Setenv("AI_TEMPERATURE", "0.2")
	t.Setenv("AI_JSON_MODE", "true")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if cfg.AIMaxTokens != 16384 {
		t.Errorf("expected AIMaxTokens 16384, got %d", cfg.AIMaxTokens)
	}
	if cfg.AITemperature != 0.2 {
		t.Errorf("expected AITemperature 0.2, got %v", cfg.AITemperature)
	}
	if !cfg.AIJSONMode {
		t.Error("expected AIJSONMode true")
	}
}

func TestLoadConfig_InvalidAIMaxTokens(t *testing.T) {
	requiredEnvVars(t)

	for _, v := range []string{"abc", "0", "-5"} {
		t.Setenv("AI_MAX_TOKENS", v)
		if _, err := Load(); err == nil {
			t.Errorf("expected error for AI_MAX_TOKENS=%q", v)
		}
	}
}

func TestLoadConfig_InvalidAITemperature(t *testing.T) {
	requiredEnvVars(t)

	for _, v := range []string{"abc", "-0.1", "2.5"} {
		t.Setenv("AI_TEMPERATURE", v)
		if _, err := Load(); err == nil {
			t.Errorf("expected error for AI_TEMPERATURE=%q", v)
		}
	}
}

func TestLoadConfig_AIJSONModeParsing(t *testing.T) {
	requiredEnvVars(t)

	for _, v := range []string{"1", "true", "TRUE", "yes", "on"} {
		t.Setenv("AI_JSON_MODE", v)
		cfg, err := Load()
		if err != nil {
			t.Fatalf("expected no error for AI_JSON_MODE=%q, got %v", v, err)
		}
		if !cfg.AIJSONMode {
			t.Errorf("expected AIJSONMode true for %q", v)
		}
	}

	for _, v := range []string{"0", "false", "no", "off", "banana"} {
		t.Setenv("AI_JSON_MODE", v)
		cfg, err := Load()
		if err != nil {
			t.Fatalf("expected no error for AI_JSON_MODE=%q, got %v", v, err)
		}
		if cfg.AIJSONMode {
			t.Errorf("expected AIJSONMode false for %q", v)
		}
	}
}

func TestLoadConfig_MissingNvidiaKey(t *testing.T) {
	t.Setenv("DATABASE_URL", "postgres://user:pass@localhost/db")
	t.Setenv("JWT_SECRET", "this-is-a-very-long-secret-string-of-at-least-32-chars")
	t.Setenv("NVIDIA_API_KEY", "")
	t.Setenv("AI_API_KEY", "")

	_, err := Load()
	if err == nil {
		t.Fatal("expected error for missing AI/NVIDIA API key")
	}
}

func TestLoadConfig_DefaultProviderIsNvidia(t *testing.T) {
	t.Setenv("DATABASE_URL", "postgres://user:pass@localhost/db")
	t.Setenv("JWT_SECRET", "this-is-a-very-long-secret-string-of-at-least-32-chars")
	t.Setenv("NVIDIA_API_KEY", "test-nvidia-key")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if cfg.EnrichmentProvider != "nvidia" {
		t.Errorf("expected default nvidia, got %s", cfg.EnrichmentProvider)
	}
}

func TestLoadConfig_EmailFromDefault(t *testing.T) {
	requiredEnvVars(t)

	cfg, err := Load()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if cfg.EmailFrom != "Koder <noreply@koder.sbs>" {
		t.Errorf("expected default EmailFrom, got %s", cfg.EmailFrom)
	}
}

func TestLoadConfig_EmailFromCustom(t *testing.T) {
	requiredEnvVars(t)
	t.Setenv("EMAIL_FROM", "Custom <custom@example.com>")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if cfg.EmailFrom != "Custom <custom@example.com>" {
		t.Errorf("expected custom EmailFrom, got %s", cfg.EmailFrom)
	}
}

func TestLoadConfig_ResendWebhookSecretDefault(t *testing.T) {
	requiredEnvVars(t)

	cfg, err := Load()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if cfg.ResendWebhookSecret != "" {
		t.Errorf("expected empty webhook secret by default, got %s", cfg.ResendWebhookSecret)
	}
}

func TestLoadConfig_ResendWebhookSecretCustom(t *testing.T) {
	requiredEnvVars(t)
	t.Setenv("RESEND_WEBHOOK_SECRET", "whsec_testsecret")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if cfg.ResendWebhookSecret != "whsec_testsecret" {
		t.Errorf("expected custom webhook secret, got %s", cfg.ResendWebhookSecret)
	}
}

func TestExecutorTimeout(t *testing.T) {
	cfg := &Config{ExecutorTimeoutSeconds: 30}
	d := cfg.ExecutorTimeout()
	if d != 30*time.Second {
		t.Errorf("expected 30s, got %v", d)
	}
}

func TestPythonTimeout(t *testing.T) {
	cfg := &Config{PythonExecutorTimeout: 60}
	d := cfg.PythonTimeout()
	if d != 60*time.Second {
		t.Errorf("expected 60s, got %v", d)
	}
}

func TestJWTExpiry(t *testing.T) {
	cfg := &Config{JWTExpiryHours: 24}
	d := cfg.JWTExpiry()
	if d != 24*time.Hour {
		t.Errorf("expected 24h, got %v", d)
	}
}

func TestLoadConfig_InvalidJWTExpiry(t *testing.T) {
	requiredEnvVars(t)
	t.Setenv("JWT_EXPIRY_HOURS", "not-a-number")

	_, err := Load()
	if err == nil {
		t.Fatal("expected error for invalid JWT_EXPIRY_HOURS")
	}
}

func TestLoadConfig_InvalidAccessTokenMinutes(t *testing.T) {
	requiredEnvVars(t)
	t.Setenv("ACCESS_TOKEN_EXPIRY_MINUTES", "-1")

	_, err := Load()
	if err == nil {
		t.Fatal("expected error for ACCESS_TOKEN_EXPIRY_MINUTES <= 0")
	}
}

func TestLoadConfig_InvalidRefreshTokenDays(t *testing.T) {
	requiredEnvVars(t)
	t.Setenv("REFRESH_TOKEN_EXPIRY_DAYS", "0")

	_, err := Load()
	if err == nil {
		t.Fatal("expected error for REFRESH_TOKEN_EXPIRY_DAYS <= 0")
	}
}

func TestLoadConfig_EmptyAllowedOrigin(t *testing.T) {
	requiredEnvVars(t)
	t.Setenv("ENVIRONMENT", "development")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	expected := "https://koder.sbs,https://www.koder.sbs,http://localhost:3000"
	if cfg.AllowedOrigin != expected {
		t.Errorf("expected default %q, got %s", expected, cfg.AllowedOrigin)
	}
	if cfg.FrontendURL != "http://localhost:3000" {
		t.Errorf("expected fallback FrontendURL http://localhost:3000, got %s", cfg.FrontendURL)
	}
}

func TestLoadConfig_EmptyAllowedOriginProd(t *testing.T) {
	requiredEnvVars(t)
	t.Setenv("ENVIRONMENT", "production")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	expected := "https://koder.sbs,https://www.koder.sbs,http://localhost:3000"
	if cfg.AllowedOrigin != expected {
		t.Errorf("expected default %q, got %s", expected, cfg.AllowedOrigin)
	}
	if cfg.FrontendURL != "http://localhost:3000" {
		t.Errorf("expected fallback FrontendURL http://localhost:3000, got %s", cfg.FrontendURL)
	}
}

func TestLoadConfig_AllowedOriginsPluralTakesPrecedence(t *testing.T) {
	requiredEnvVars(t)
	t.Setenv("ALLOWED_ORIGINS", "https://custom-domain.com,https://www.custom-domain.com")
	t.Setenv("ALLOWED_ORIGIN", "https://old-domain.com")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if cfg.AllowedOrigin != "https://custom-domain.com,https://www.custom-domain.com" {
		t.Errorf("expected ALLOWED_ORIGINS value, got %s", cfg.AllowedOrigin)
	}
}

func TestLoadConfig_AllowedOriginSingularFallback(t *testing.T) {
	requiredEnvVars(t)
	t.Setenv("ALLOWED_ORIGIN", "https://legacy-domain.com")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if cfg.AllowedOrigin != "https://legacy-domain.com" {
		t.Errorf("expected ALLOWED_ORIGIN fallback value, got %s", cfg.AllowedOrigin)
	}
}
