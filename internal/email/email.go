// Package email renders the project's transactional email templates. All
// templates use the HTML table layout + inline CSS pattern for maximum
// compatibility across major email clients (Gmail, Outlook, Apple Mail).
//
// html/template auto-escapes every user-supplied value (recipient name, URLs)
// so templates can never be used for HTML injection.
package email

import (
	"bytes"
	"html"
	"html/template"
	"io"
	"regexp"
	"strings"
	"time"
)

// Brand tokens (mirrored from frontend/app/globals.css).
const (
	EmailBackground = "#FFFFFF" // page background
	CardSurface     = "#F7F8FA" // content card surface
	BorderColor     = "#E5E7EB" // borders, dividers
	TextPrimary     = "#111827" // primary text
	TextSecondary   = "#6B7280" // secondary text
	MutedText       = "#4B5563" // muted paragraph text
	ButtonGold      = "#D4AF37" // CTA background
	ButtonGoldDark  = "#B8941F" // CTA bottom border (3D effect)
	PurplePrimary   = "#53389E" // brand purple (numbers, titles)
	PurpleMid       = "#7F56D9" // brand purple (accents, badges)
	PurpleLight     = "#F3E8FF" // light purple (icon badge bg)
	PurpleDark      = "#9E77ED" // brand purple (lighter accent)
)

// LockIconDataURI is an inline SVG padlock (Lucide-style stroke) encoded as a
// data URI so it renders even when a client blocks external images and needs
// zero network requests. Rendered as a CSS background on the hero badge; the
// bgcolor attribute keeps the circle visible if a client strips CSS images.
const LockIconDataURI = "data:image/svg+xml;charset=utf-8," +
	"%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E" +
	"%3Crect x='3' y='11' width='18' height='11' rx='2' ry='2'/%3E" +
	"%3Cpath d='M7 11V7a5 5 0 0 1 10 0v4'/%3E%3C/svg%3E"

// LogoDataURI is a minimal inline SVG logo used when an external logo URL
// is unavailable or blocked by the email client.
const LogoDataURI = "data:image/svg+xml;charset=utf-8," +
	"%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36' fill='none'%3E" +
	"%3Crect width='36' height='36' rx='10' fill='%23D4AF37'/%3E" +
	"%3Cpath d='M12 10h4l4 8-4 8h-4l4-8-4-8Z' fill='%23111727'/%3E%3C/svg%3E"

func renderLogoHTML(logoURL template.URL) template.HTML {
	src := string(LogoDataURI)
	if len(strings.TrimSpace(string(logoURL))) > 0 {
		src = string(logoURL)
	}
	return template.HTML(`<div style="width:36px;height:36px;border-radius:12px;background-color:` + ButtonGold + `;display:inline-flex;align-items:center;justify-content:center;border:1px solid ` + BorderColor + `;overflow:hidden;"><img src="` + src + `" width="36" height="36" alt="Koder logo" style="display:block;width:36px;height:36px;border:0;outline:none;text-decoration:none;" /></div>`)
}

// PasswordResetData is the data model for the password-reset email.
type PasswordResetData struct {
	PlatformName string       // display name, e.g. "Koder"
	FirstName    string       // recipient's name (auto-escaped)
	ResetURL     string       // one-time reset link (auto-escaped)
	LogoURL      template.URL // absolute or safe inline URL to the platform logo
	LogoHTML     template.HTML
	SupportEmail string // mailto address
	Tagline      string // one-line brand message (footer)
	ExpiresIn    string // human-readable expiry, e.g. "1 hour"
	Year         int    // copyright year
	PreviewTitle string // <title> override for email client preview
	PreheaderText string // hidden preheader text shown before email is opened
}

// RenderPasswordReset renders the password-reset email into w.
func RenderPasswordReset(w io.Writer, data PasswordResetData) error {
	if data.PlatformName == "" {
		data.PlatformName = "Koder"
	}
	if data.ExpiresIn == "" {
		data.ExpiresIn = "1 hour"
	}
	if data.Year == 0 {
		data.Year = time.Now().Year()
	}
	data.LogoHTML = renderLogoHTML(data.LogoURL)
	return passwordResetTmpl.ExecuteTemplate(w, "layoutBase", data)
}

// RenderPasswordResetString renders the password-reset email and returns the
// full HTML document as a string.
func RenderPasswordResetString(data PasswordResetData) (string, error) {
	var buf bytes.Buffer
	if err := RenderPasswordReset(&buf, data); err != nil {
		return "", err
	}
	return buf.String(), nil
}

// ProblemReminderData is the data model for a problem reminder / campaign email.
type ProblemReminderData struct {
	PlatformName   string
	FirstName      string
	ProblemTitle   string
	ProblemSlug    string
	ProblemExcerpt string
	// ProblemExcerptHTML contains rendered, safe HTML for the excerpt
	ProblemExcerptHTML template.HTML
	CTAURL             string
	LogoURL            template.URL
	LogoHTML           template.HTML
	SupportEmail       string
	Tagline            string
	Year               int
	PreviewTitle       string
	PreheaderText      string
}

// RenderProblemReminder renders a problem reminder email into w.
func RenderProblemReminder(w io.Writer, data ProblemReminderData) error {
	if data.PlatformName == "" {
		data.PlatformName = "Koder"
	}
	if data.Year == 0 {
		data.Year = time.Now().Year()
	}
	data.LogoHTML = renderLogoHTML(data.LogoURL)
	// Render markdown excerpt to safe HTML and attach
	if data.ProblemExcerpt != "" {
		htmlStr := renderMarkdownToHTML(data.ProblemExcerpt)
		data.ProblemExcerptHTML = template.HTML(htmlStr)
	}
	return problemReminderTmpl.ExecuteTemplate(w, "layoutBase", data)
}

// RenderProblemReminderString renders the reminder email and returns the HTML.
func RenderProblemReminderString(data ProblemReminderData) (string, error) {
	var buf bytes.Buffer
	if err := RenderProblemReminder(&buf, data); err != nil {
		return "", err
	}
	return buf.String(), nil
}

// renderMarkdownToHTML performs a small, safe markdown -> HTML conversion
// tailored for email: headings, fenced code blocks, inline code, bold,
// italics, links and simple - lists. Input is HTML-escaped first to avoid
// raw HTML injection; the output contains inline styles suitable for the
// light email shell.
func renderMarkdownToHTML(md string) string {
	s := strings.TrimSpace(md)
	// escape raw HTML first
	s = html.EscapeString(s)

	// fenced code blocks ```lang\n...``` -> styled <pre><code>
	codeRe := regexp.MustCompile("(?s)```(?:[a-zA-Z0-9_-]*\\n)?(.*?)```")
	s = codeRe.ReplaceAllStringFunc(s, func(m string) string {
		sub := codeRe.ReplaceAllString(m, "$1")
		return `<pre style="background:` + CardSurface + `;padding:14px;border-radius:12px;color:` + TextPrimary + `;overflow:auto;font-family:monospace;line-height:1.5;"><code>` + sub + `</code></pre>`
	})

	// Headings
	s = regexp.MustCompile(`(?m)^###\s*(.+)$`).ReplaceAllString(s, `<h3 style="margin:14px 0 6px;color:`+TextPrimary+`;font-size:16px;">$1</h3>`)
	s = regexp.MustCompile(`(?m)^##\s*(.+)$`).ReplaceAllString(s, `<h2 style="margin:16px 0 8px;color:`+TextPrimary+`;font-size:18px;">$1</h2>`)
	s = regexp.MustCompile(`(?m)^#\s*(.+)$`).ReplaceAllString(s, `<h1 style="margin:18px 0 10px;color:`+TextPrimary+`;font-size:22px;">$1</h1>`)

	// Inline code
	s = regexp.MustCompile("`([^`]+)`").ReplaceAllString(s, `<code style="background:`+CardSurface+`;padding:2px 6px;border-radius:6px;color:`+TextPrimary+`;font-family:monospace;">$1</code>`)

	// Bold then italics
	s = regexp.MustCompile(`\*\*(.+?)\*\*`).ReplaceAllString(s, `<strong style="color:`+TextPrimary+`;">$1</strong>`)
	s = regexp.MustCompile(`\*(.+?)\*`).ReplaceAllString(s, `<em style="color:`+TextSecondary+`;">$1</em>`)

	// Links [text](url)
	s = regexp.MustCompile(`\[([^\]]+)\]\(([^)]+)\)`).ReplaceAllString(s, `<a href="$2" style="color:`+ButtonGold+`;text-decoration:none;">$1</a>`)

	// Lines -> paragraphs and simple lists
	lines := strings.Split(s, "\n")
	var out []string
	inList := false
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if strings.HasPrefix(trimmed, "- ") {
			if !inList {
				out = append(out, `<ul style="margin:10px 0 10px 20px;padding:0;">`)
				inList = true
			}
			item := strings.TrimSpace(trimmed[2:])
			out = append(out, `<li style="margin-bottom:8px;color:`+TextPrimary+`">`+item+`</li>`)
		} else {
			if inList {
				out = append(out, `</ul>`)
				inList = false
			}
			if trimmed == "" {
				out = append(out, "")
			} else {
				out = append(out, `<p style="margin:10px 0;color:`+TextSecondary+`;line-height:1.7;">`+trimmed+`</p>`)
			}
		}
	}
	if inList {
		out = append(out, `</ul>`)
	}
	return strings.Join(out, "\n")
}

// TrophyIconDataURI is an inline SVG trophy (Lucide-style stroke) in gold,
// used as the hero icon for the Best Practices announcement email.
const TrophyIconDataURI = "data:image/svg+xml;charset=utf-8," +
	"%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%23D4AF37' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E" +
	"%3Cpath d='M6 9H4.5a2.5 2.5 0 0 1 0-5H6'/%3E" +
	"%3Cpath d='M18 9h1.5a2.5 2.5 0 0 0 0-5H18'/%3E" +
	"%3Cpath d='M4 22h16'/%3E" +
	"%3Cpath d='M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22'/%3E" +
	"%3Cpath d='M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22'/%3E" +
	"%3Cpath d='M18 2H6v7a6 6 0 0 0 12 0V2Z'/%3E%3C/svg%3E"

// HeartIconDataURI is an inline SVG heart in gold for the Community Solutions card.
const HeartIconDataURI = "data:image/svg+xml;charset=utf-8," +
	"%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23D4AF37' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E" +
	"%3Cpath d='M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'/%3E%3C/svg%3E"

// SparklesIconDataURI is an inline SVG sparkles in gold for the AI Analysis card.
const SparklesIconDataURI = "data:image/svg+xml;charset=utf-8," +
	"%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23D4AF37' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E" +
	"%3Cpath d='m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z'/%3E" +
	"%3Cpath d='M5 3v4'/%3E%3Cpath d='M19 17v4'/%3E" +
	"%3Cpath d='M3 5h4'/%3E%3Cpath d='M17 19h4'/%3E%3C/svg%3E"

// StarIconDataURI is an inline SVG star in gold for the How to Get Featured card.
const StarIconDataURI = "data:image/svg+xml;charset=utf-8," +
	"%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23D4AF37' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E" +
	"%3Cpolygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'/%3E%3C/svg%3E"

// SmallHeartIconDataURI is a 12×12 inline SVG heart in amber for the like
// badge in the Top Solutions list. Replaces the &#9829; HTML entity so the
// icon renders consistently across all email clients (including Outlook).
const SmallHeartIconDataURI = "data:image/svg+xml;charset=utf-8," +
	"%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2392400E' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E" +
	"%3Cpath d='M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'/%3E%3C/svg%3E"

// DigestSolution holds the data for a single solution preview in the Best Practices email.
type DigestSolution struct {
	UserName     string
	ProblemTitle string
	Language     string
	Likes        int
}

// BestPracticesData is the data model for the Best Practices announcement email.
type BestPracticesData struct {
	PlatformName   string
	FirstName      string
	CTAURL         string
	LogoURL        template.URL
	LogoHTML       template.HTML
	SupportEmail   string
	Tagline        string
	Year           int
	SolutionCount  int
	GoCount        int
	PythonCount    int
	TotalLikes     int
	BestRuntimeMs  int
	DeveloperCount int
	TopSolutions   []DigestSolution
	PreviewTitle   string
	PreheaderText  string
}

// RenderBestPractices renders the Best Practices announcement email into w.
func RenderBestPractices(w io.Writer, data BestPracticesData) error {
	if data.PlatformName == "" {
		data.PlatformName = "Koder"
	}
	if data.Year == 0 {
		data.Year = time.Now().Year()
	}
	data.LogoHTML = renderLogoHTML(data.LogoURL)
	return bestPracticesTmpl.ExecuteTemplate(w, "layoutBase", data)
}

// RenderBestPracticesString renders the Best Practices email and returns the
// full HTML document as a string.
func RenderBestPracticesString(data BestPracticesData) (string, error) {
	var buf bytes.Buffer
	if err := RenderBestPractices(&buf, data); err != nil {
		return "", err
	}
	return buf.String(), nil
}

var bestPracticesTmpl = template.Must(template.New("best-practices").Parse(
	layoutBase + bestPracticesBodyWithIcons(),
))

func bestPracticesBodyWithIcons() string {
	s := bestPracticesBody()
	s = strings.Replace(s, "{{__TROPHY_ICON__}}", TrophyIconDataURI, 1)
	s = strings.Replace(s, "{{__HEART_ICON__}}", HeartIconDataURI, 1)
	s = strings.Replace(s, "{{__SPARKLES_ICON__}}", SparklesIconDataURI, 1)
	s = strings.Replace(s, "{{__STAR_ICON__}}", StarIconDataURI, 1)
	s = strings.Replace(s, "{{__SMALL_HEART_ICON__}}", SmallHeartIconDataURI, -1)
	return s
}

func bestPracticesBody() string {
	return `{{define "content"}}

<!-- Header band -->
<tr>
<td style="background-color:` + EmailBackground + `;padding:20px 16px;border-left:4px solid ` + PurpleMid + `;" bgcolor="` + EmailBackground + `">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="left">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td style="vertical-align:middle;">
{{.LogoHTML}}
</td>
<td style="width:12px;">&nbsp;</td>
<td style="vertical-align:middle;">
<div style="font-size:20px;font-weight:700;color:` + TextPrimary + `;letter-spacing:-0.3px;">{{.PlatformName}}</div>
<div style="margin-top:4px;color:` + TextSecondary + `;font-size:12px;">{{.Tagline}}</div>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>

<!-- Hero -->
<tr>
<td style="padding:32px 16px 0 16px;text-align:center;">

<div style="width:72px;height:72px;border-radius:50%;background-color:` + PurpleMid + `;display:inline-flex;align-items:center;justify-content:center;margin-bottom:18px;" bgcolor="` + PurpleMid + `"><img src="{{__TROPHY_ICON__}}" width="32" height="32" alt="" style="display:block;border:0;" /></div>

<h1 style="margin:0;font-size:30px;line-height:36px;color:` + TextPrimary + `;font-weight:700;letter-spacing:-0.3px;">Discover Best Practices</h1>

<div style="width:40px;height:3px;background-color:` + PurpleMid + `;border-radius:2px;margin:16px auto 0;"></div>

<p style="margin:18px auto 0;max-width:420px;color:` + TextSecondary + `;font-size:16px;line-height:24px;">
See how top developers solve real problems. Browse community solutions, get AI-powered code analysis, and learn from the best.
</p>

</td>
</tr>

<!-- Stats bar -->
<tr>
<td style="padding:24px 16px 0 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:` + CardSurface + `;border:1px solid ` + BorderColor + `;border-radius:16px;border-top:3px solid ` + PurpleMid + `;box-shadow:0 2px 8px rgba(83,56,158,0.08);">
<tr>
<td style="padding:16px 6px;text-align:center;width:20%;">
<div style="font-size:22px;font-weight:700;color:` + PurplePrimary + `;">{{.SolutionCount}}</div>
<div style="font-size:10px;color:` + TextSecondary + `;text-transform:uppercase;letter-spacing:0.08em;margin-top:2px;">Solutions</div>
</td>
<td style="padding:16px 6px;text-align:center;width:20%;border-left:1px solid ` + BorderColor + `;">
<div style="font-size:22px;font-weight:700;color:` + PurplePrimary + `;">{{.DeveloperCount}}</div>
<div style="font-size:10px;color:` + TextSecondary + `;text-transform:uppercase;letter-spacing:0.08em;margin-top:2px;">Developers</div>
</td>
<td style="padding:16px 6px;text-align:center;width:20%;border-left:1px solid ` + BorderColor + `;">
<div style="font-size:22px;font-weight:700;color:` + PurplePrimary + `;">{{.TotalLikes}}</div>
<div style="font-size:10px;color:` + TextSecondary + `;text-transform:uppercase;letter-spacing:0.08em;margin-top:2px;">Likes</div>
</td>
<td style="padding:16px 6px;text-align:center;width:20%;border-left:1px solid ` + BorderColor + `;">
<div style="font-size:22px;font-weight:700;color:` + PurplePrimary + `;">{{.GoCount}}</div>
<div style="font-size:10px;color:` + TextSecondary + `;text-transform:uppercase;letter-spacing:0.08em;margin-top:2px;">Go</div>
</td>
<td style="padding:16px 6px;text-align:center;width:20%;border-left:1px solid ` + BorderColor + `;">
<div style="font-size:22px;font-weight:700;color:` + PurplePrimary + `;">{{.PythonCount}}</div>
<div style="font-size:10px;color:` + TextSecondary + `;text-transform:uppercase;letter-spacing:0.08em;margin-top:2px;">Python</div>
</td>
</tr>
</table>
</td>
</tr>

<!-- Feature Card 1: Community Solutions -->
<tr>
<td style="padding:20px 16px 0 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:` + CardSurface + `;border:1px solid ` + BorderColor + `;border-radius:16px;border-left:4px solid ` + PurpleMid + `;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
<tr>
<td style="padding:20px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td style="vertical-align:top;width:40px;">
<div style="width:40px;height:40px;border-radius:12px;background-color:` + PurpleLight + `;display:inline-flex;align-items:center;justify-content:center;"><img src="{{__HEART_ICON__}}" width="20" height="20" alt="" style="display:block;border:0;" /></div>
</td>
<td style="vertical-align:top;padding-left:12px;">
<div style="font-size:16px;font-weight:700;color:` + PurplePrimary + `;">Community Solutions</div>
<p style="margin:6px 0 0;font-size:14px;line-height:22px;color:` + TextSecondary + `;">Compare how others approached the same problem. Sort by most liked, fastest runtime, or newest submissions. Every solution includes the full source code and developer stats.</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>

<!-- Feature Card 2: AI Analysis -->
<tr>
<td style="padding:12px 16px 0 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:` + CardSurface + `;border:1px solid ` + BorderColor + `;border-radius:16px;border-left:4px solid ` + PurpleMid + `;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
<tr>
<td style="padding:20px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td style="vertical-align:top;width:40px;">
<div style="width:40px;height:40px;border-radius:12px;background-color:` + PurpleLight + `;display:inline-flex;align-items:center;justify-content:center;"><img src="{{__SPARKLES_ICON__}}" width="20" height="20" alt="" style="display:block;border:0;" /></div>
</td>
<td style="vertical-align:top;padding-left:12px;">
<div style="font-size:16px;font-weight:700;color:` + PurplePrimary + `;">AI-Powered Code Analysis</div>
<p style="margin:6px 0 0;font-size:14px;line-height:22px;color:` + TextSecondary + `;">Click any solution to get instant AI analysis: quality scores, efficiency and readability ratings, time and space complexity breakdown, key techniques, strengths, and areas for improvement. Ask follow-up questions about the approach.</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>

<!-- Feature Card 3: How to Get Featured -->
<tr>
<td style="padding:12px 16px 0 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:` + CardSurface + `;border:1px solid ` + BorderColor + `;border-radius:16px;border-left:4px solid ` + PurpleMid + `;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
<tr>
<td style="padding:20px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td style="vertical-align:top;width:40px;">
<div style="width:40px;height:40px;border-radius:12px;background-color:#FEF3C7;display:inline-flex;align-items:center;justify-content:center;"><img src="{{__STAR_ICON__}}" width="20" height="20" alt="" style="display:block;border:0;" /></div>
</td>
<td style="vertical-align:top;padding-left:12px;">
<div style="font-size:16px;font-weight:700;color:` + PurplePrimary + `;">How to Get Featured</div>
<p style="margin:6px 0 0;font-size:14px;line-height:22px;color:` + TextSecondary + `;">Solve any problem to submit your solution. Other developers can like your code, and the top-rated solutions appear at the top of Best Practices. The more problems you solve, the more your solutions get discovered.</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>

<!-- Top Solutions Preview -->
{{if .TopSolutions}}
<tr>
<td style="padding:24px 16px 0 16px;">
<div style="display:inline-block;border-left:3px solid ` + PurpleMid + `;padding-left:10px;margin-bottom:12px;"><span style="font-size:13px;text-transform:uppercase;letter-spacing:0.1em;color:` + TextSecondary + `;font-weight:600;">Top Rated Solutions</span></div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ` + BorderColor + `;border-radius:16px;overflow:hidden;">
{{range $i, $s := .TopSolutions}}
<tr{{if $i}} style="border-top:1px solid ` + BorderColor + `;"{{end}}>
<td style="padding:14px 16px;border-left:3px solid ` + PurpleMid + `;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td>
<div style="font-size:14px;font-weight:600;color:` + TextPrimary + `;">{{.ProblemTitle}}</div>
<div style="font-size:12px;color:` + PurplePrimary + `;margin-top:2px;">by {{.UserName}} &middot; {{.Language}}</div>
</td>
<td align="right" style="white-space:nowrap;">
<div style="display:inline-flex;align-items:center;gap:4px;background-color:#FEF3C7;border-radius:20px;padding:4px 10px;">
<img src="{{__SMALL_HEART_ICON__}}" width="12" height="12" alt="" style="display:inline-block;vertical-align:middle;border:0;" /><span style="font-size:12px;font-weight:600;color:#92400E;">{{.Likes}}</span>
</div>
</td>
</tr>
</table>
</td>
</tr>
{{end}}
</table>
</td>
</tr>
{{end}}

<!-- CTA -->
<tr>
<td style="padding:28px 16px 0 16px;text-align:center;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
<tr>
<td style="border-radius:14px;background-color:` + ButtonGold + `;border-bottom:2px solid ` + ButtonGoldDark + `;box-shadow:0 4px 14px rgba(212,175,55,0.35);">
<a href="{{.CTAURL}}" style="display:inline-block;padding:14px 32px;font-size:16px;font-weight:700;color:#121212;text-decoration:none;border-radius:14px;letter-spacing:0.2px;">Explore Best Practices</a>
</td>
</tr>
</table>

</td>
</tr>

<!-- Fallback link -->
<tr>
<td style="padding:16px 16px 0 16px;">
<div style="background-color:` + EmailBackground + `;border:1px solid ` + BorderColor + `;border-left:3px solid ` + PurpleMid + `;border-radius:14px;padding:16px;">
<div style="font-size:13px;color:` + TextSecondary + `;margin-bottom:8px;font-weight:600;">Button not working?</div>
<div style="word-break:break-all;font-size:14px;line-height:22px;color:` + TextPrimary + `;"><a href="{{.CTAURL}}" style="color:` + PurpleMid + `;text-decoration:none;">{{.CTAURL}}</a></div>
</div>
</td>
</tr>

<!-- Footer -->
<tr>
<td style="padding:24px 16px 32px 16px;background-color:` + EmailBackground + `;border-top:2px solid ` + PurpleMid + `;" bgcolor="` + EmailBackground + `">

<div style="font-size:14px;color:` + PurplePrimary + `;font-weight:600;">{{.PlatformName}}</div>
<div style="margin-top:10px;font-size:13px;line-height:20px;color:` + TextSecondary + `;">{{.Tagline}}</div>
<div style="margin-top:14px;font-size:13px;line-height:20px;color:` + TextSecondary + `;">Sent by Jerry Koko from Koder</div>
<div style="margin-top:14px;font-size:13px;line-height:20px;color:` + TextSecondary + `;">Need help? <a href="mailto:{{.SupportEmail}}" style="color:` + PurpleMid + `;text-decoration:none;">{{.SupportEmail}}</a></div>
<div style="margin-top:16px;font-size:12px;line-height:18px;color:` + TextSecondary + `;">&copy; {{.Year}} {{.PlatformName}}. All rights reserved.</div>

</td>
</tr>

{{end}}`
}

var problemReminderTmpl = template.Must(template.New("problem-reminder").Parse(layoutBase + problemReminderBody()))

func problemReminderBody() string {
	return `{{define "content"}}

<!-- Header band -->
<tr>
<td style="background-color:` + EmailBackground + `;padding:20px 16px;border-left:4px solid ` + PurpleMid + `;" bgcolor="` + EmailBackground + `">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="left">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td style="vertical-align:middle;">
{{.LogoHTML}}
</td>
<td style="width:12px;">&nbsp;</td>
<td style="vertical-align:middle;">
<div style="font-size:20px;font-weight:700;color:` + TextPrimary + `;letter-spacing:-0.3px;">{{.PlatformName}}</div>
<div style="margin-top:4px;color:` + TextSecondary + `;font-size:12px;">{{.Tagline}}</div>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>

<!-- Hero -->
<tr>
<td style="padding:24px 16px 0 16px;">

<h1 style="margin:0;font-size:28px;line-height:34px;color:` + TextPrimary + `;font-weight:700;letter-spacing:-0.3px;">Ready for a quick challenge?</h1>

<p style="margin:14px 0 0;color:` + TextSecondary + `;font-size:16px;line-height:24px;">
Sharpen your skills with this short exercise: <strong style="color:` + TextPrimary + `;">{{.ProblemTitle}}</strong>
</p>

</td>
</tr>

<!-- Problem card & CTA -->
<tr>
<td style="padding:20px 16px 0 16px;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:` + CardSurface + `;border:1px solid ` + BorderColor + `;border-radius:16px;border-left:4px solid ` + PurpleMid + `;">
<tr>
<td style="padding:20px;color:` + TextPrimary + `;font-size:14px;line-height:22px;">
<div style="font-size:18px;font-weight:700;color:` + PurplePrimary + `;margin-bottom:8px;">{{.ProblemTitle}}</div>
<div style="font-size:14px;color:` + TextSecondary + `;margin-bottom:16px;line-height:22px;">{{.ProblemExcerptHTML}}</div>
<div>
<a href="{{.CTAURL}}" style="display:inline-block;padding:14px 24px;background-color:` + ButtonGold + `;border-bottom:2px solid ` + ButtonGoldDark + `;box-shadow:0 4px 14px rgba(212,175,55,0.35);color:#121212;font-weight:700;border-radius:12px;text-decoration:none;">Open Problem</a>
</div>
</td>
</tr>
</table>

</td>
</tr>

<!-- Fallback link -->
<tr>
<td style="padding:14px 16px 0 16px;">
<div style="background-color:` + EmailBackground + `;border:1px solid ` + BorderColor + `;border-left:3px solid ` + PurpleMid + `;border-radius:14px;padding:16px;">
<div style="font-size:13px;color:` + TextSecondary + `;margin-bottom:8px;font-weight:600;">Button not working?</div>
<div style="word-break:break-all;font-size:14px;line-height:22px;color:` + TextPrimary + `;"><a href="{{.CTAURL}}" style="color:` + PurpleMid + `;text-decoration:none;">{{.CTAURL}}</a></div>
</div>
</td>
</tr>

<!-- Footer -->
<tr>
<td style="padding:24px 16px 32px 16px;background-color:` + EmailBackground + `;border-top:2px solid ` + PurpleMid + `;" bgcolor="` + EmailBackground + `">

<div style="font-size:14px;color:` + PurplePrimary + `;font-weight:600;">{{.PlatformName}}</div>
<div style="margin-top:10px;font-size:13px;line-height:20px;color:` + TextSecondary + `;">{{.Tagline}}</div>
<div style="margin-top:14px;font-size:13px;line-height:20px;color:` + TextSecondary + `;">Sent by Jerry Koko from Koder</div>
<div style="margin-top:14px;font-size:13px;line-height:20px;color:` + TextSecondary + `;">Need help? <a href="mailto:{{.SupportEmail}}" style="color:` + PurpleMid + `;text-decoration:none;">{{.SupportEmail}}</a></div>
<div style="margin-top:16px;font-size:12px;line-height:18px;color:` + TextSecondary + `;">&copy; {{.Year}} {{.PlatformName}}. All rights reserved.</div>

</td>
</tr>

{{end}}`
}

// passwordResetTmpl is a reusable document shell (dark background, centered
// 600px column, email-safe table markup) with a "content" slot that each email
// type fills. Future templates (verification, welcome, enrollment) reuse the
// same layout by swapping the content definition.
//
// LockIconDataURI is a static value, so it is spliced into the template source
// at parse time (not passed as data) — html/template's CSS url() sanitizer
// would otherwise rewrite a data: URI to #ZgotmplZ.
var passwordResetTmpl = template.Must(template.New("password-reset").Parse(
	layoutBase + passwordResetBodyWithIcon(),
))

func passwordResetBodyWithIcon() string {
	return strings.Replace(passwordResetBody, "{{__LOCK_ICON__}}", LockIconDataURI, 1)
}

const layoutBase = `{{define "layoutBase"}}<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>{{if .PreviewTitle}}{{.PreviewTitle}}{{else}}{{.PlatformName}}{{end}}</title>
</head>
<body style="margin:0;padding:0;background-color:` + EmailBackground + `;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:` + TextPrimary + `;">
{{if .PreheaderText}}<div style="display:none;font-size:1px;color:#FFFFFF;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">{{.PreheaderText}}</div>{{end}}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:` + EmailBackground + `;padding:24px 12px;">
<tr>
<td align="center">

<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:` + CardSurface + `;border-radius:20px;overflow:hidden;">

{{template "content" .}}

</table>

</td>
</tr>
</table>

</body>
</html>{{end}}`

const passwordResetBody = `{{define "content"}}

<!-- Header band -->
<tr>
<td style="background-color:` + EmailBackground + `;padding:18px 16px;border-left:4px solid ` + PurpleMid + `;" bgcolor="` + EmailBackground + `">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="left">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td style="vertical-align:middle;">
{{.LogoHTML}}
</td>
<td style="width:14px;">&nbsp;</td>
<td style="vertical-align:middle;">
<div style="font-size:26px;font-weight:700;color:` + TextPrimary + `;letter-spacing:-0.5px;">{{.PlatformName}}</div>
<div style="margin-top:4px;color:` + TextSecondary + `;font-size:13px;letter-spacing:0.3px;">{{.Tagline}}</div>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>

<!-- Hero -->
<tr>
<td style="padding:18px 16px 0 16px;">

<div style="width:72px;height:72px;border-radius:50%;background-color:` + EmailBackground + `;display:flex;align-items:center;justify-content:center;margin-bottom:18px;border:1px solid ` + BorderColor + `;">
{{.LogoHTML}}
</div>

<h1 style="margin:0;font-size:32px;line-height:40px;color:` + TextPrimary + `;font-weight:700;letter-spacing:-0.3px;">Reset your password</h1>

<p style="margin:20px 0 0;color:` + TextPrimary + `;font-size:16px;line-height:28px;">
Hi <strong style="color:` + TextPrimary + `;">{{.FirstName}}</strong>,
</p>

<p style="margin:10px 0 0;color:` + MutedText + `;font-size:15px;line-height:24px;">
We received a request to reset the password for your {{.PlatformName}} account.
</p>

<p style="margin:10px 0 0;color:` + MutedText + `;font-size:15px;line-height:24px;">
If you made this request, click the button below to choose a new password.
</p>

</td>
</tr>

<!-- CTA -->
<tr>
<td style="padding:20px 16px 0 16px;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0;">
<tr>
<td style="border-radius:14px;background-color:` + ButtonGold + `;border-bottom:2px solid ` + ButtonGoldDark + `;box-shadow:0 4px 14px rgba(212,175,55,0.35);">
<a href="{{.ResetURL}}" style="display:inline-block;padding:14px 32px;font-size:16px;font-weight:700;color:#121212;text-decoration:none;border-radius:14px;letter-spacing:0.2px;">Reset Password</a>
</td>
</tr>
</table>

<p style="margin-top:18px;margin-bottom:0;font-size:14px;line-height:22px;color:` + TextSecondary + `;">
This secure link expires in <strong style="color:` + TextPrimary + `;">{{.ExpiresIn}}</strong>.

</td>
</tr>

<!-- Security -->
<tr>
<td style="padding:24px 16px 0 16px;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:` + CardSurface + `;border:1px solid ` + BorderColor + `;border-radius:16px;">
<tr>
<td style="padding:20px;color:` + TextPrimary + `;font-size:15px;line-height:24px;">
<h2 style="margin:0;font-size:20px;color:` + TextPrimary + `;font-weight:700;">Didn't request this?</h2>
<p style="margin:18px 0 0;color:` + TextSecondary + `;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
<p style="margin:14px 0 0;color:` + TextSecondary + `;">If you believe someone attempted to access your account, we recommend changing your password immediately after signing in and reviewing your recent account activity.</p>
</td>
</tr>
</table>

</td>
</tr>

<!-- Backup URL -->
<tr>
<td style="padding:20px 16px 0 16px;">

<div style="background-color:` + EmailBackground + `;border:1px solid ` + BorderColor + `;border-left:3px solid ` + PurpleMid + `;border-radius:14px;padding:16px;">
<div style="font-size:13px;color:` + TextSecondary + `;margin-bottom:10px;font-weight:600;">Button not working?</div>
<div style="word-break:break-all;font-size:14px;line-height:22px;color:` + TextPrimary + `;"><a href="{{.ResetURL}}" style="color:` + PurpleMid + `;text-decoration:none;">{{.ResetURL}}</a></div>
</div>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="padding:24px 16px 32px 16px;background-color:` + EmailBackground + `;border-top:2px solid ` + PurpleMid + `;" bgcolor="` + EmailBackground + `">

<div style="font-size:14px;color:` + PurplePrimary + `;font-weight:600;">{{.PlatformName}}</div>
<div style="margin-top:12px;font-size:13px;line-height:22px;color:` + TextSecondary + `;">{{.Tagline}}</div>
<div style="margin-top:14px;font-size:13px;line-height:22px;color:` + TextSecondary + `;">Sent by Jerry Koko from Koder</div>
<div style="margin-top:18px;font-size:13px;line-height:22px;color:` + TextSecondary + `;">Need help? <a href="mailto:{{.SupportEmail}}" style="color:` + PurpleMid + `;text-decoration:none;">{{.SupportEmail}}</a></div>
<div style="margin-top:18px;font-size:12px;line-height:20px;color:` + TextSecondary + `;">&copy; {{.Year}} {{.PlatformName}}. All rights reserved.</div>

</td>
</tr>

{{end}}`
