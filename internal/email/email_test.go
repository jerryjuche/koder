package email

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"image/png"
	"math"
	"regexp"
	"strconv"
	"strings"
	"testing"
)

func testData() PasswordResetData {
	return PasswordResetData{
		PlatformName:  "Koder",
		FirstName:     "Ada",
		ResetURL:      "https://koder.sbs/reset-password?token=abc123&x=1",
		SupportEmail:  "support@koder.sbs",
		Tagline:       "Koder turns every problem into an instant feedback loop.",
		PreviewTitle:  "Reset Your Password — Koder",
		PreheaderText: "Hi Ada, we received a password reset request for your Koder account.",
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
		"<title>Reset Your Password — Koder</title>",
		"display:none;font-size:1px;color:#FFFFFF;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;",
		"Hi Ada, we received a password reset request",
		"Reset your password",
		"Hi <strong style=\"color:#111827;\">Ada</strong>",
		"https://koder.sbs/reset-password?token=abc123&amp;x=1",
		`src="cid:koder-logo"`,
		"background-color:#D4AF37",
		"border-bottom:2px solid #B8941F",
		"Reset Password",
		"This link expires in <strong style=\"color:#111827;\">1 hour</strong>.",
		"Didn't request this?",
		"Or copy this link:",
		"support@koder.sbs",
		"mailto:support@koder.sbs",
		"Koder turns every problem into an instant feedback loop.",
		">Jerry</div>",
		">Koder</div>",
		"&copy; ",
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
	for _, want := range []string{"Koder", "1 hour", "<title>Koder</title>"} {
		if !strings.Contains(out, want) {
			t.Errorf("default not applied, missing %q", want)
		}
	}
}

// TestInlineLogoForPreview covers the admin preview path: browsers cannot
// resolve cid: URLs, so preview markup carries the logo as a data URI.
func TestInlineLogoForPreview(t *testing.T) {
	out, err := RenderPasswordResetString(testData())
	if err != nil {
		t.Fatalf("render failed: %v", err)
	}
	if !strings.Contains(out, "cid:"+LogoContentID) {
		t.Fatal("expected the sent email to keep the cid: reference")
	}

	preview := InlineLogoForPreview(out)
	if strings.Contains(preview, "cid:") {
		t.Errorf("preview markup still references cid:")
	}
	if !strings.Contains(preview, "data:image/png;base64,"+base64.StdEncoding.EncodeToString(LogoPNG())[:32]) {
		t.Error("preview markup is missing the inlined logo data URI")
	}

	// Markup without a logo reference is returned unchanged.
	if got := InlineLogoForPreview("<p>plain</p>"); got != "<p>plain</p>" {
		t.Errorf("unexpected rewrite: %q", got)
	}
}

func TestEmbeddedLogoMatchesInlineAttachment(t *testing.T) {
	cfg, err := png.DecodeConfig(bytes.NewReader(LogoPNG()))
	if err != nil {
		t.Fatalf("embedded logo is not a valid PNG: %v", err)
	}
	if cfg.Width == 0 || cfg.Height == 0 {
		t.Fatalf("embedded logo has no dimensions: %dx%d", cfg.Width, cfg.Height)
	}

	// The rendered dimensions must preserve the artwork's aspect ratio so the
	// wide lockup is never squashed into a square (the old bug).
	artRatio := float64(cfg.Width) / float64(cfg.Height)
	displayRatio := float64(LogoDisplayWidth) / float64(LogoDisplayHeight)
	if math.Abs(artRatio-displayRatio) > 0.05 {
		t.Errorf("logo aspect ratio drifted: artwork %.2f vs display %.2f", artRatio, displayRatio)
	}

	attachments := EmailAttachments()
	if len(attachments) != 1 {
		t.Fatalf("expected 1 inline attachment, got %d", len(attachments))
	}
	att := attachments[0]
	if att["content_id"] != LogoContentID {
		t.Errorf("attachment content_id = %q, want %q", att["content_id"], LogoContentID)
	}
	if att["filename"] != LogoFilename {
		t.Errorf("attachment filename = %q, want %q", att["filename"], LogoFilename)
	}
	raw, err := base64.StdEncoding.DecodeString(att["content"])
	if err != nil {
		t.Fatalf("attachment content is not base64: %v", err)
	}
	if !bytes.Equal(raw, LogoPNG()) {
		t.Errorf("attachment bytes differ from the embedded logo")
	}
}

// TestRenderedEmailsInlineTheLogo guards the fix for the inconsistent header
// logo: every template must reference the CID attachment and must not
// hot-link an external image, so the artwork cannot be proxied, blocked, or
// 404 on a different deployment.
func TestRenderedEmailsInlineTheLogo(t *testing.T) {
	emails := map[string]func() (string, error){
		"password-reset": func() (string, error) { return RenderPasswordResetString(testData()) },
		"reminder": func() (string, error) {
			return RenderProblemReminderString(ProblemReminderData{
				FirstName:    "Ada",
				ProblemTitle: "Binary Search",
				CTAURL:       "https://koder.sbs/problems/binary-search",
			})
		},
		"best-practices": func() (string, error) {
			return RenderBestPracticesString(BestPracticesData{
				FirstName: "Ada",
				CTAURL:    "https://koder.sbs/home",
			})
		},
	}

	for name, render := range emails {
		out, err := render()
		if err != nil {
			t.Fatalf("%s: render failed: %v", name, err)
		}
		for _, want := range []string{
			`src="cid:` + LogoContentID + `"`,
			`alt="Koder"`,
			`width="` + strconv.Itoa(LogoDisplayWidth) + `"`,
			`height="` + strconv.Itoa(LogoDisplayHeight) + `"`,
		} {
			if !strings.Contains(out, want) {
				t.Errorf("%s: header logo missing %q", name, want)
			}
		}
		if strings.Contains(out, "logo.png\"") {
			t.Errorf("%s: header logo must not be hot-linked from an external URL", name)
		}
	}
}

// TestBuildResendPayloadIncludesInlineLogo verifies the wire payload carries
// the inline logo, so the CID reference in the HTML resolves in every client.
func TestBuildResendPayloadIncludesInlineLogo(t *testing.T) {
	payload := BuildResendPayload("Koder <noreply@koder.sbs>", []string{"ada@example.com"}, "Subject", "<p>hi</p>", "hi")

	raw, err := json.Marshal(payload)
	if err != nil {
		t.Fatalf("marshal payload: %v", err)
	}

	var decoded struct {
		From        string              `json:"from"`
		To          []string            `json:"to"`
		HTML        string              `json:"html"`
		Attachments []map[string]string `json:"attachments"`
	}
	if err := json.Unmarshal(raw, &decoded); err != nil {
		t.Fatalf("unmarshal payload: %v", err)
	}
	if decoded.From == "" || len(decoded.To) != 1 || decoded.HTML != "<p>hi</p>" {
		t.Errorf("payload lost core fields: %+v", decoded)
	}
	if len(decoded.Attachments) != 1 {
		t.Fatalf("expected 1 inline attachment, got %d", len(decoded.Attachments))
	}
	att := decoded.Attachments[0]
	if att["content_id"] != LogoContentID || att["filename"] != LogoFilename {
		t.Errorf("unexpected inline attachment: %+v", att)
	}
	if att["content"] == "" {
		t.Error("inline attachment has no content")
	}
}

// TestRenderedEmailsUseCompactTypeScale keeps the templates compact: nothing
// renders larger than the 17px heading size.
func TestRenderedEmailsUseCompactTypeScale(t *testing.T) {
	out, err := RenderPasswordResetString(testData())
	if err != nil {
		t.Fatalf("render failed: %v", err)
	}

	sizeRe := regexp.MustCompile(`font-size:(\d+)px`)
	matches := sizeRe.FindAllStringSubmatch(out, -1)
	if len(matches) == 0 {
		t.Fatal("no font sizes found in rendered email")
	}
	for _, m := range matches {
		px, err := strconv.Atoi(m[1])
		if err != nil {
			t.Fatalf("unparseable font size %q: %v", m[1], err)
		}
		if px == 1 {
			continue // hidden preheader, deliberately 1px
		}
		if px > 17 {
			t.Errorf("font-size:%dpx exceeds the compact 17px ceiling", px)
		}
		if px < 10 {
			t.Errorf("font-size:%dpx is below the 10px readability floor", px)
		}
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
		Year:          2026,
		PreviewTitle:  "Discover Best Practices — Koder",
		PreheaderText: "See top-rated community solutions, get AI-powered code analysis, and learn from the best developers.",
	}

	out, err := RenderBestPracticesString(data)
	if err != nil {
		t.Fatalf("render failed: %v", err)
	}

	required := []string{
		"<!DOCTYPE html>",
		`<html lang="en">`,
		`<meta name="color-scheme" content="light">`,
		"<title>Discover Best Practices — Koder</title>",
		"display:none;font-size:1px;color:#FFFFFF;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;",
		"See top-rated community solutions",
		"Discover Best Practices",
		"Top community solutions for real problems",
		"Community solutions",
		"Code analysis",
		"How to Get Featured",
		"Explore Best Practices",
		"https://koder.sbs/home", // CTA URL
		"Top Rated Solutions",
		"Sum Two Numbers",
		"Fibonacci",
		"Alice",
		"Bob",
		"Or copy this link:",
		"support@koder.sbs",
		"mailto:support@koder.sbs",
		"Koder turns every problem into an instant feedback loop.",
		">Jerry</div>",
		">Koder</div>",
		"&copy; ",
		"border-bottom:2px solid #B8941F",
	}
	for _, want := range required {
		if !strings.Contains(out, want) {
			t.Errorf("rendered best-practices email missing %q", want)
		}
	}

	// No emoji glyphs in the output.
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
		"Browse solutions sorted by likes, runtime, or recency",
		"Open any solution for quality, complexity, and technique notes",
		"Solve problems, share solutions, earn likes",
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
	for _, want := range []string{"Koder", "Explore Best Practices", "<title>Koder</title>"} {
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
		SupportEmail:   "support@koder.sbs",
		Tagline:        "Koder turns every problem into an instant feedback loop.",
		Year:           2026,
		PreviewTitle:   "Binary Search — Koder",
		PreheaderText:  "A new challenge is waiting: Binary Search.",
	}

	out, err := RenderProblemReminderString(data)
	if err != nil {
		t.Fatalf("render failed: %v", err)
	}

	for _, want := range []string{
		`<meta name="color-scheme" content="light">`,
		"<title>Binary Search — Koder</title>",
		"display:none;font-size:1px;color:#FFFFFF;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;",
		"A new challenge is waiting: Binary Search",
		"background-color:#F7F8FA",
		"background-color:#FFFFFF",
		"background-color:#D4AF37",
		"Koder",
		"Binary Search",
		"Open Problem",
		"support@koder.sbs",
		"mailto:support@koder.sbs",
		"Koder turns every problem into an instant feedback loop.",
		">Jerry</div>",
		">Koder</div>",
	} {
		if !strings.Contains(out, want) {
			t.Errorf("rendered reminder missing %q", want)
		}
	}

	if strings.ContainsAny(out, "😀🔒🤖🚀✨🔥") {
		t.Errorf("rendered email contains emoji characters")
	}
}
