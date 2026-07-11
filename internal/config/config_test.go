package config


import (
	"os"
	"testing"
	"time"
)

func TestLoadConfig_Success(t *testing.T) {
	os.Setenv("DATABASE_URL", "postgres://user:pass@localhost/db")
	os.Setenv("JWT_SECRET", "this-is-a-very-long-secret-string-of-at-least-32-chars")
	os.Setenv("GEMINI_API_KEY", "test-api-key")
	os.Setenv("PORT", "8080")

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

	// Clean up
	os.Unsetenv("DATABASE_URL")
	os.Unsetenv("JWT_SECRET")
	os.Unsetenv("GEMINI_API_KEY")
	os.Unsetenv("PORT")
}

func TestLoadConfig_MissingDatabaseURL(t *testing.T) {
	os.Unsetenv("DATABASE_URL")

	_, err := Load()
	if err == nil {
		t.Fatal("expected error for missing DATABASE_URL")
	}
	if err.Error() != "DATABASE_URL is required" {
		t.Errorf("expected DATABASE_URL is required, got %v", err)
	}
}

func TestLoadConfig_MissingJWTSecret(t *testing.T) {
	os.Setenv("DATABASE_URL", "postgres://user:pass@localhost/db")
	os.Unsetenv("JWT_SECRET")

	_, err := Load()
	if err == nil {
		t.Fatal("expected error for missing JWT_SECRET")
	}
	if err.Error() != "JWT_SECRET is required" {
		t.Errorf("expected JWT_SECRET is required, got %v", err)
	}

	os.Unsetenv("DATABASE_URL")
}

func TestLoadConfig_JWTSecretTooShort(t *testing.T) {
	os.Setenv("DATABASE_URL", "postgres://user:pass@localhost/db")
	os.Setenv("JWT_SECRET", "short")

	_, err := Load()
	if err == nil {
		t.Fatal("expected error for short JWT_SECRET")
	}

	os.Unsetenv("DATABASE_URL")
	os.Unsetenv("JWT_SECRET")
}

func TestLoadConfig_InvalidPort(t *testing.T) {
	os.Setenv("DATABASE_URL", "postgres://user:pass@localhost/db")
	os.Setenv("JWT_SECRET", "this-is-a-very-long-secret-string-of-at-least-32-chars")
	os.Setenv("GEMINI_API_KEY", "test-api-key")
	os.Setenv("PORT", "invalid")

	_, err := Load()
	if err == nil {
		t.Fatal("expected error for invalid PORT")
	}

	os.Unsetenv("DATABASE_URL")
	os.Unsetenv("JWT_SECRET")
	os.Unsetenv("GEMINI_API_KEY")
	os.Unsetenv("PORT")
}

func TestLoadConfig_Defaults(t *testing.T) {
	os.Setenv("DATABASE_URL", "postgres://user:pass@localhost/db")
	os.Setenv("JWT_SECRET", "this-is-a-very-long-secret-string-of-at-least-32-chars")
	os.Setenv("GEMINI_API_KEY", "test-api-key")
	os.Unsetenv("PORT")
	os.Unsetenv("EXECUTOR_MAX_CONCURRENCY")
	os.Unsetenv("EXECUTOR_TIMEOUT_SECONDS")

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

	os.Unsetenv("DATABASE_URL")
	os.Unsetenv("JWT_SECRET")
	os.Unsetenv("GEMINI_API_KEY")
}

func TestLoadConfig_MissingGeminiKey(t *testing.T) {
	os.Setenv("DATABASE_URL", "postgres://user:pass@localhost/db")
	os.Setenv("JWT_SECRET", "this-is-a-very-long-secret-string-of-at-least-32-chars")
	os.Unsetenv("GEMINI_API_KEY")

	_, err := Load()
	if err == nil {
		t.Fatal("expected error for missing GEMINI_API_KEY")
	}

	os.Unsetenv("DATABASE_URL")
	os.Unsetenv("JWT_SECRET")
}

func TestLoadConfig_GroqDefaults(t *testing.T) {
	os.Setenv("DATABASE_URL", "postgres://user:pass@localhost/db")
	os.Setenv("JWT_SECRET", "this-is-a-very-long-secret-string-of-at-least-32-chars")
	os.Setenv("ENRICHMENT_PROVIDER", "groq")
	os.Setenv("GROQ_API_KEY", "test-groq-key")
	os.Unsetenv("GEMINI_API_KEY")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if cfg.EnrichmentProvider != "groq" {
		t.Errorf("expected groq, got %s", cfg.EnrichmentProvider)
	}
	if cfg.GroqModel != "llama-3.3-70b-versatile" {
		t.Errorf("expected default groq model, got %s", cfg.GroqModel)
	}

	os.Unsetenv("DATABASE_URL")
	os.Unsetenv("JWT_SECRET")
	os.Unsetenv("ENRICHMENT_PROVIDER")
	os.Unsetenv("GROQ_API_KEY")
}

func TestLoadConfig_DefaultProviderSelection(t *testing.T) {
	os.Setenv("DATABASE_URL", "postgres://user:pass@localhost/db")
	os.Setenv("JWT_SECRET", "this-is-a-very-long-secret-string-of-at-least-32-chars")
	os.Unsetenv("ENRICHMENT_PROVIDER")
	os.Unsetenv("GROQ_API_KEY")
	os.Setenv("GEMINI_API_KEY", "test-gemini-key")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if cfg.EnrichmentProvider != "gemini" {
		t.Errorf("expected default gemini, got %s", cfg.EnrichmentProvider)
	}

	os.Unsetenv("DATABASE_URL")
	os.Unsetenv("JWT_SECRET")
	os.Unsetenv("GEMINI_API_KEY")
}

func TestLoadConfig_ProviderSwitchToGroq(t *testing.T) {
	os.Setenv("DATABASE_URL", "postgres://user:pass@localhost/db")
	os.Setenv("JWT_SECRET", "this-is-a-very-long-secret-string-of-at-least-32-chars")
	os.Unsetenv("ENRICHMENT_PROVIDER")
	os.Unsetenv("GEMINI_API_KEY")
	os.Setenv("GROQ_API_KEY", "test-groq-key")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if cfg.EnrichmentProvider != "groq" {
		t.Errorf("expected groq since GROQ_API_KEY is set, got %s", cfg.EnrichmentProvider)
	}

	os.Unsetenv("DATABASE_URL")
	os.Unsetenv("JWT_SECRET")
	os.Unsetenv("GROQ_API_KEY")
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
	os.Setenv("DATABASE_URL", "postgres://user:pass@localhost/db")
	os.Setenv("JWT_SECRET", "this-is-a-very-long-secret-string-of-at-least-32-chars")
	os.Setenv("GEMINI_API_KEY", "test-api-key")
	os.Setenv("JWT_EXPIRY_HOURS", "not-a-number")

	_, err := Load()
	if err == nil {
		t.Fatal("expected error for invalid JWT_EXPIRY_HOURS")
	}

	os.Unsetenv("DATABASE_URL")
	os.Unsetenv("JWT_SECRET")
	os.Unsetenv("GEMINI_API_KEY")
	os.Unsetenv("JWT_EXPIRY_HOURS")
}

func TestLoadConfig_EmptyAllowedOrigin(t *testing.T) {
	os.Setenv("DATABASE_URL", "postgres://user:pass@localhost/db")
	os.Setenv("JWT_SECRET", "this-is-a-very-long-secret-string-of-at-least-32-chars")
	os.Setenv("GEMINI_API_KEY", "test-api-key")
	os.Unsetenv("ALLOWED_ORIGIN")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if cfg.AllowedOrigin != "http://localhost:3000" {
		t.Errorf("expected default http://localhost:3000, got %s", cfg.AllowedOrigin)
	}

	os.Unsetenv("DATABASE_URL")
	os.Unsetenv("JWT_SECRET")
	os.Unsetenv("GEMINI_API_KEY")
}
