package email

import (
	"html/template"
	"strings"
	"testing"
)

func testData() PasswordResetData {
	return PasswordResetData{
		PlatformName: "Koder",
		FirstName:    "Ada",
		ResetURL:     "https://koder.sbs/reset-password?token=abc123&x=1",
		LogoURL:      template.URL("https://koder.sbs/logo.png"),
		SupportEmail: "support@koder.sbs",
		Tagline:      "Koder turns every problem into an instant feedback loop.",
	}
}

func TestRenderPasswordReset_ContainsBrandAndStructure(t *testing.T) {
	out, err := RenderPasswordResetString(testData())
	if err != nil {
		t.Fatalf("render failed: %v", err)
	}

	required := []string{
		"<!DOCTYPE html>",
		`<html lang="en">`,
		`<meta name="color-scheme" content="light">`,
		"Reset your password",
		"Hi <strong style=\"color:#111827;\">Ada</strong>",
		"https://koder.sbs/reset-password?token=abc123&amp;x=1",
		"https://koder.sbs/logo.png",
		"background-color:#D4AF37",
		"Reset Password",
		"This secure link expires in <strong style=\"color:#111827;\">1 hour</strong>.",
		"Didn't request this?",
		"Button not working?",
		"support@koder.sbs",
		"mailto:support@koder.sbs",
		"Koder turns every problem into an instant feedback loop.",
		"&copy; ",
		"Koder",
	}
	for _, want := range required {
		if !strings.Contains(out, want) {
			t.Errorf("rendered email missing %q", want)
		}
	}

	// No emoji glyphs anywhere in the output.
	if strings.ContainsAny(out, "😀🔒🤖🚀✨🔥") {
		t.Errorf("rendered email contains emoji characters")
	}
}

func TestRenderPasswordReset_EscapesUserSuppliedValues(t *testing.T) {
	data := testData()
	data.FirstName = `<script>alert("xss")</script>`
	data.ResetURL = `https://koder.sbs/reset-password?token=\"><script>alert(1)</script>&ref=foo`
	data.Tagline = `Trust & <b>this</b>`

	out, err := RenderPasswordResetString(data)
	if err != nil {
		t.Fatalf("render failed: %v", err)
	}

	for _, forbidden := range []string{
		`<script>alert("xss")</script>`,
		`<script>alert(1)</script>`,
		`<b>this</b>`,
	} {
		if strings.Contains(out, forbidden) {
			t.Errorf("rendered email leaked unescaped HTML: %q", forbidden)
		}
	}

	for _, want := range []string{
		`&lt;script&gt;`,
		`&amp;`,
	} {
		if !strings.Contains(out, want) {
			t.Logf("output=%s", out)
			t.Errorf("rendered email missing escaped output %q", want)
		}
	}
}

func TestRenderPasswordReset_AppliesDefaults(t *testing.T) {
	out, err := RenderPasswordResetString(PasswordResetData{FirstName: "Ada", ResetURL: "https://koder.sbs/reset-password?token=abc"})
	if err != nil {
		t.Fatalf("render failed: %v", err)
	}
	for _, want := range []string{"Koder", "1 hour"} {
		if !strings.Contains(out, want) {
			t.Errorf("default not applied, missing %q", want)
		}
	}
}

func TestRenderPasswordReset_InlineLogoFallback(t *testing.T) {
	out, err := RenderPasswordResetString(PasswordResetData{FirstName: "Ada", ResetURL: "https://koder.sbs/reset-password?token=abc", LogoURL: template.URL("")})
	if err != nil {
		t.Fatalf("render failed: %v", err)
	}
	if !strings.Contains(out, "data:image/svg") {
		t.Errorf("expected inline SVG logo fallback, got %q", out)
	}
}

func TestRenderMarkdownToHTML_SanitizesAndRenders(t *testing.T) {
	md := "# Title\n\nThis is **bold** and *italic* and `code`.\nVisit [link](https://example.com).\n\n- item one\n- item two\n\n<script>alert(1)</script>\n```go\nfmt.Println(\"hi\")\n```\n"

	out := renderMarkdownToHTML(md)

	// basic structure
	if !strings.Contains(out, "<h1") || !strings.Contains(out, "Title") {
		t.Errorf("heading not rendered: %s", out)
	}
	if !strings.Contains(out, "<strong") || !strings.Contains(out, "bold") {
		t.Errorf("bold not rendered: %s", out)
	}
	if !strings.Contains(out, "<em") || !strings.Contains(out, "italic") {
		t.Errorf("italic not rendered: %s", out)
	}
	if !strings.Contains(out, "<code") || !strings.Contains(out, "code") {
		t.Errorf("inline code not rendered: %s", out)
	}
	if !strings.Contains(out, "<pre") || !strings.Contains(out, "fmt.Println") {
		t.Errorf("fenced code block not rendered: %s", out)
	}
	if !strings.Contains(out, `<a href="https://example.com"`) {
		t.Errorf("link not rendered: %s", out)
	}

	// Ensure script tag is escaped, not present raw
	if strings.Contains(out, "<script>") {
		t.Errorf("raw script tag leaked: %s", out)
	}
	if !strings.Contains(out, "&lt;script&gt;") {
		t.Errorf("escaped script missing: %s", out)
	}
}

func TestRenderProblemReminderString_ContainsLightThemeStyling(t *testing.T) {
	data := ProblemReminderData{
		PlatformName:   "Koder",
		FirstName:      "Ada",
		ProblemTitle:   "Binary Search",
		ProblemSlug:    "binary-search",
		ProblemExcerpt: "Solve the classic **search** problem in *log n* time.",
		CTAURL:         "https://koder.sbs/problems/binary-search",
		LogoURL:        "https://koder.sbs/logo.png",
		SupportEmail:   "support@koder.sbs",
		Tagline:        "Koder turns every problem into an instant feedback loop.",
		Year:           2026,
	}

	out, err := RenderProblemReminderString(data)
	if err != nil {
		t.Fatalf("render failed: %v", err)
	}

	for _, want := range []string{
		`<meta name="color-scheme" content="light">`,
		"background-color:#F7F8FA",
		"background-color:#FFFFFF",
		"background-color:#D4AF37",
		"Koder",
		"Binary Search",
		"Open Problem",
		"support@koder.sbs",
		"mailto:support@koder.sbs",
		"Koder turns every problem into an instant feedback loop.",
	} {
		if !strings.Contains(out, want) {
			t.Errorf("rendered reminder missing %q", want)
		}
	}

	if strings.ContainsAny(out, "😀🔒🤖🚀✨🔥") {
		t.Errorf("rendered email contains emoji characters")
	}
}
