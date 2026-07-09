package main

import (
	"strings"
	"testing"
)

func TestFormatSecurityFriendlyMessageIncludesReasonAndTip(t *testing.T) {
	msg := formatSecurityFriendlyMessage("security: open() is not allowed")
	if !strings.Contains(msg, "open() is not allowed") {
		t.Fatalf("expected message to include the security reason, got %q", msg)
	}
	if !strings.Contains(msg, "Tip:") {
		t.Fatalf("expected message to include a tip, got %q", msg)
	}
}

func TestFormatSecurityFriendlyMessageFallsBackToGenericText(t *testing.T) {
	msg := formatSecurityFriendlyMessage("")
	if !strings.Contains(msg, "sandbox security checks") {
		t.Fatalf("expected fallback message to mention sandbox checks, got %q", msg)
	}
}
