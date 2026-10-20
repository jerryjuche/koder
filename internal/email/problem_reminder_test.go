package email

import (
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
		SupportEmail:   "support@koder.sbs",
		Tagline:        "Koder turns every problem into an instant feedback loop.",
		PreviewTitle:   "Sum Two Numbers — Koder",
		PreheaderText:  "A new challenge is waiting: Sum Two Numbers. Sharpen your skills with this short exercise.",
	}

	out, err := RenderProblemReminderString(data)
	if err != nil {
		t.Fatalf("render failed: %v", err)
	}

	required := []string{
		"<!DOCTYPE html>",
		"<title>Sum Two Numbers — Koder</title>",
		"display:none;font-size:1px;color:#FFFFFF;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;",
		"A new challenge is waiting: Sum Two Numbers",
		"Ready for a quick challenge?",
		"Sum Two Numbers",
		"Add two integers and return the sum.",
		"Open Problem",
		`src="cid:` + LogoContentID + `"`,
		"support@koder.sbs",
		">Jerry</div>",
		">Koder</div>",
		"border-bottom:2px solid #B8941F",
	}

	for _, want := range required {
		if !strings.Contains(out, want) {
			t.Errorf("rendered email missing %q", want)
		}
	}
}
