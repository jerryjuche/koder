package store

import (
	"errors"
	"testing"
)

func TestFriendlyError_Error(t *testing.T) {
	e := &FriendlyError{Code: "TEST_CODE", Message: "test message"}
	if e.Error() != "test message" {
		t.Errorf("expected 'test message', got %q", e.Error())
	}
}

func TestNewDuplicateError(t *testing.T) {
	e := NewDuplicateError("duplicate resource")
	if e.Code != "DUPLICATE_RESOURCE" {
		t.Errorf("expected code DUPLICATE_RESOURCE, got %q", e.Code)
	}
	if e.Message != "duplicate resource" {
		t.Errorf("expected message 'duplicate resource', got %q", e.Message)
	}
}

func TestNewNotFoundError(t *testing.T) {
	e := NewNotFoundError("not found")
	if e.Code != "NOT_FOUND" {
		t.Errorf("expected code NOT_FOUND, got %q", e.Code)
	}
	if e.Message != "not found" {
		t.Errorf("expected message 'not found', got %q", e.Message)
	}
}

func TestNewValidationError(t *testing.T) {
	e := NewValidationError("invalid input")
	if e.Code != "VALIDATION_ERROR" {
		t.Errorf("expected code VALIDATION_ERROR, got %q", e.Code)
	}
	if e.Message != "invalid input" {
		t.Errorf("expected message 'invalid input', got %q", e.Message)
	}
}

func TestIsFriendlyError(t *testing.T) {
	t.Run("friendly error", func(t *testing.T) {
		fe := NewDuplicateError("test")
		code, msg, ok := IsFriendlyError(fe)
		if !ok {
			t.Error("expected ok=true")
		}
		if code != "DUPLICATE_RESOURCE" {
			t.Errorf("expected DUPLICATE_RESOURCE, got %q", code)
		}
		if msg != "test" {
			t.Errorf("expected 'test', got %q", msg)
		}
	})

	t.Run("nil error", func(t *testing.T) {
		_, _, ok := IsFriendlyError(nil)
		if ok {
			t.Error("expected ok=false for nil")
		}
	})

	t.Run("plain error", func(t *testing.T) {
		_, _, ok := IsFriendlyError(errors.New("plain error"))
		if ok {
			t.Error("expected ok=false for plain error")
		}
	})

	t.Run("wrapped friendly error", func(t *testing.T) {
		fe := NewNotFoundError("wrapped")
		wrapped := errors.New("wrapper: " + fe.Error())
		_, _, ok := IsFriendlyError(wrapped)
		if ok {
			t.Error("expected ok=false for unwrapped error")
		}
	})
}

func TestIsUniqueViolation_NonPgError(t *testing.T) {
	msg, ok := IsUniqueViolation(errors.New("not a pg error"))
	if ok {
		t.Error("expected ok=false for non-pg error")
	}
	if msg != "" {
		t.Errorf("expected empty message, got %q", msg)
	}
}

func TestIsUniqueViolation_Nil(t *testing.T) {
	msg, ok := IsUniqueViolation(nil)
	if ok {
		t.Error("expected ok=false for nil")
	}
	if msg != "" {
		t.Errorf("expected empty message, got %q", msg)
	}
}
