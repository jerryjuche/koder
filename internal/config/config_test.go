package config


import (
	"os"
	"testing"
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
