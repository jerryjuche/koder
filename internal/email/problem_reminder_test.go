package email

import (
	"html/template"
	"strings"
	"testing"
)

func TestRenderProblemReminder_ContainsExpectedFields(t *testing.T) {
	data := ProblemReminderData{
		PlatformName:   "Koder",
		FirstName:      "Ada",
		ProblemTitle:   "Sum Two Numbers",
		ProblemSlug:    "sum-two-numbers",
		ProblemExcerpt: "Add two integers and return the sum.",
		CTAURL:         "https://koder.sbs/problems/sum-two-numbers",
		LogoURL:        "https://koder.sbs/logo.png",
		SupportEmail:   "support@koder.sbs",
		Tagline:        "Koder turns every problem into an instant feedback loop.",
	}

	out, err := RenderProblemReminderString(data)
	if err != nil {
		t.Fatalf("render failed: %v", err)
	}

	required := []string{
		"<!DOCTYPE html>",
		"Ready for a quick challenge?",
		"Sum Two Numbers",
		"Add two integers and return the sum.",
		"Open Problem",
		"https://koder.sbs/logo.png",
		"support@koder.sbs",
	}

	for _, want := range required {
		if !strings.Contains(out, want) {
			t.Errorf("rendered email missing %q", want)
		}
	}
}

func TestRenderProblemReminder_InlineLogoFallback(t *testing.T) {
	data := ProblemReminderData{
		PlatformName:   "Koder",
		FirstName:      "Ada",
		ProblemTitle:   "Sum Two Numbers",
		ProblemSlug:    "sum-two-numbers",
		ProblemExcerpt: "Add two integers and return the sum.",
		CTAURL:         "https://koder.sbs/problems/sum-two-numbers",
		LogoURL:        template.URL(""),
		SupportEmail:   "support@koder.sbs",
		Tagline:        "Koder turns every problem into an instant feedback loop.",
	}

	out, err := RenderProblemReminderString(data)
	if err != nil {
		t.Fatalf("render failed: %v", err)
	}
	if !strings.Contains(out, "data:image/svg") {
		t.Errorf("expected inline SVG logo fallback, got %q", out)
	}
}
