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
	if !strings.Contains(out, "background-image:url('data:image/svg+xml") {
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

func TestRenderBestPractices_ContainsBrandAndStructure(t *testing.T) {
	data := BestPracticesData{
		PlatformName:   "Koder",
		FirstName:      "Ada",
		CTAURL:         "https://koder.sbs/home",
		LogoURL:        template.URL("https://koder.sbs/logo.png"),
		SupportEmail:   "support@koder.sbs",
		Tagline:        "Koder turns every problem into an instant feedback loop.",
		SolutionCount:  42,
		GoCount:        28,
		PythonCount:    14,
		TotalLikes:     156,
		BestRuntimeMs:  3,
		DeveloperCount: 18,
		TopSolutions: []DigestSolution{
			{UserName: "Alice", ProblemTitle: "Sum Two Numbers", Language: "go", Likes: 24},
			{UserName: "Bob", ProblemTitle: "Fibonacci", Language: "python", Likes: 19},
		},
		Year: 2026,
	}

	out, err := RenderBestPracticesString(data)
	if err != nil {
		t.Fatalf("render failed: %v", err)
	}

	required := []string{
		"<!DOCTYPE html>",
		`<html lang="en">`,
		`<meta name="color-scheme" content="light">`,
		"Introducing Best Practices",
		"See how top developers solve real problems",
		"42",                    // solution count
		"18",                    // developer count
		"156",                   // total likes
		"28 / 14",               // Go / Python
		"Community Solutions",
		"AI-Powered Code Analysis",
		"How to Get Featured",
		"Explore Best Practices",
		"https://koder.sbs/home", // CTA URL
		"Top Rated Solutions",
		"Sum Two Numbers",
		"Fibonacci",
		"Alice",
		"Bob",
		"Button not working?",
		"support@koder.sbs",
		"mailto:support@koder.sbs",
		"Koder turns every problem into an instant feedback loop.",
		"&copy; ",
	}
	for _, want := range required {
		if !strings.Contains(out, want) {
			t.Errorf("rendered best-practices email missing %q", want)
		}
	}

	if strings.ContainsAny(out, "😀🔒🤖🚀✨🔥") {
		t.Errorf("rendered email contains emoji characters")
	}
}

func TestRenderBestPractices_FeatureCardsPresent(t *testing.T) {
	out, err := RenderBestPracticesString(BestPracticesData{
		PlatformName: "Koder",
		FirstName:    "Coder",
		CTAURL:       "https://koder.sbs/home",
	})
	if err != nil {
		t.Fatalf("render failed: %v", err)
	}

	for _, want := range []string{
		"Compare how others approached the same problem",
		"Click any solution to get instant AI analysis",
		"Solve any problem to submit your solution",
	} {
		if !strings.Contains(out, want) {
			t.Errorf("feature card description missing %q", want)
		}
	}
}

func TestRenderBestPractices_NoSolutionsHidesSection(t *testing.T) {
	out, err := RenderBestPracticesString(BestPracticesData{
		PlatformName: "Koder",
		CTAURL:       "https://koder.sbs/home",
	})
	if err != nil {
		t.Fatalf("render failed: %v", err)
	}
	if strings.Contains(out, "Top Rated Solutions") {
		t.Errorf("expected 'Top Rated Solutions' section hidden when no solutions provided")
	}
}

func TestRenderBestPractices_EscapesUserSuppliedValues(t *testing.T) {
	data := BestPracticesData{
		PlatformName: "Koder",
		FirstName:    `<script>alert("xss")</script>`,
		CTAURL:       `https://koder.sbs/reset-password?token=\"><script>alert(1)</script>`,
		Tagline:      `Trust & <b>this</b>`,
	}

	out, err := RenderBestPracticesString(data)
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
			t.Errorf("rendered email missing escaped output %q", want)
		}
	}
}

func TestRenderBestPractices_AppliesDefaults(t *testing.T) {
	out, err := RenderBestPracticesString(BestPracticesData{CTAURL: "https://koder.sbs/home"})
	if err != nil {
		t.Fatalf("render failed: %v", err)
	}
	for _, want := range []string{"Koder", "Explore Best Practices"} {
		if !strings.Contains(out, want) {
			t.Errorf("default not applied, missing %q", want)
		}
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
