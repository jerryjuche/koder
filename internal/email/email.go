// Package email renders the project's transactional email templates. All
// templates use the HTML table layout + inline CSS pattern for maximum
// compatibility across major email clients (Gmail, Outlook, Apple Mail).
//
// html/template auto-escapes every user-supplied value (recipient name, URLs)
// so templates can never be used for HTML injection.
//
// The brand logo is embedded in the binary and delivered as an inline CID
// attachment (see logo.go) rather than hot-linked from the frontend domain:
// hot-linked images are rewritten by image proxies, blocked by default in
// several clients, and break whenever FRONTEND_URL points at a different
// deployment — which is what made the header logo render inconsistently.
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
	PurplePrimary   = "#53389E" // brand purple (numbers, titles) — legacy, prefer gold
	PurpleMid       = "#7F56D9" // brand purple (accents, badges) — legacy, prefer gold
	PurpleLight     = "#F3E8FF" // light purple tint
	PurpleDark      = "#9E77ED" // brand purple (lighter accent) — legacy, prefer gold
)

// Compact type scale shared by every template. Email clients render 12–13px
// comfortably; the previous 14–24px scale read as oversized and pushed the
// important content below the fold.
const (
	FontHeading   = "17px" // h1
	FontSubhead   = "13px" // section/card titles
	FontBody      = "12px" // paragraphs, greetings
	FontBodySmall = "11px" // card body copy, notes, lists
	FontCaption   = "10px" // fallback URLs, legal footer
)

// PasswordResetData is the data model for the password-reset email.
type PasswordResetData struct {
	PlatformName  string // display name, e.g. "Koder"
	FirstName     string // recipient's name (auto-escaped)
	ResetURL      string // one-time reset link (auto-escaped)
	LogoHTML      template.HTML
	SupportEmail  string // mailto address
	Tagline       string // one-line brand message (footer)
	ExpiresIn     string // human-readable expiry, e.g. "1 hour"
	Year          int    // copyright year
	PreviewTitle  string // <title> override for email client preview
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
	data.LogoHTML = renderLogoHTML()
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
	data.LogoHTML = renderLogoHTML()
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
		return `<pre style="background:` + CardSurface + `;margin:8px 0;padding:10px 12px;border-radius:8px;color:` + TextPrimary + `;overflow:auto;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:` + FontBodySmall + `;line-height:1.5;"><code>` + sub + `</code></pre>`
	})

	// Headings
	s = regexp.MustCompile(`(?m)^###\s*(.+)$`).ReplaceAllString(s, `<h3 style="margin:10px 0 4px;color:`+TextPrimary+`;font-size:`+FontBody+`;line-height:17px;">$1</h3>`)
	s = regexp.MustCompile(`(?m)^##\s*(.+)$`).ReplaceAllString(s, `<h2 style="margin:12px 0 5px;color:`+TextPrimary+`;font-size:`+FontSubhead+`;line-height:18px;">$1</h2>`)
	s = regexp.MustCompile(`(?m)^#\s*(.+)$`).ReplaceAllString(s, `<h1 style="margin:12px 0 6px;color:`+TextPrimary+`;font-size:15px;line-height:20px;">$1</h1>`)

	// Inline code
	s = regexp.MustCompile("`([^`]+)`").ReplaceAllString(s, `<code style="background:`+CardSurface+`;padding:1px 4px;border-radius:4px;color:`+TextPrimary+`;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:`+FontBodySmall+`;">$1</code>`)

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
				out = append(out, `<ul style="margin:6px 0 6px 16px;padding:0;">`)
				inList = true
			}
			item := strings.TrimSpace(trimmed[2:])
			out = append(out, `<li style="margin-bottom:3px;color:`+TextPrimary+`;font-size:`+FontBodySmall+`;line-height:17px;">`+item+`</li>`)
		} else {
			if inList {
				out = append(out, `</ul>`)
				inList = false
			}
			if trimmed == "" {
				out = append(out, "")
			} else {
				out = append(out, `<p style="margin:6px 0;color:`+TextSecondary+`;font-size:`+FontBodySmall+`;line-height:17px;">`+trimmed+`</p>`)
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
	data.LogoHTML = renderLogoHTML()
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

<!-- Header: logo only (the lockup already contains the wordmark) -->
<tr>
<td class="card-pad" style="padding:12px 20px;" bgcolor="` + EmailBackground + `">
{{.LogoHTML}}
</td>
</tr>

<!-- Header divider -->
<tr><td style="height:1px;background-color:` + BorderColor + `;font-size:0;line-height:0;">&nbsp;</td></tr>

<!-- Hero -->
<tr>
<td class="card-pad" style="padding:16px 20px 0 20px;text-align:left;">

<p style="margin:0 0 8px 0;color:` + TextPrimary + `;font-size:` + FontBody + `;line-height:18px;">Hi <strong style="color:` + TextPrimary + `;">{{.FirstName}}</strong>,</p>

<h1 style="margin:0;font-size:` + FontHeading + `;line-height:22px;color:` + TextPrimary + `;font-weight:700;letter-spacing:-0.2px;">Discover Best Practices</h1>

<p style="margin:5px 0 0;color:` + TextSecondary + `;font-size:` + FontBodySmall + `;line-height:17px;">
Top community solutions for real problems — full source, ranked by likes and speed.
</p>

</td>
</tr>

<!-- Feature Card 1: Community Solutions -->
<tr>
<td class="card-pad" style="padding:12px 20px 0 20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:` + CardSurface + `;border:1px solid ` + BorderColor + `;border-radius:8px;border-left:2px solid ` + ButtonGold + `;">
<tr>
<td style="padding:10px 12px;">
<div style="font-size:` + FontSubhead + `;font-weight:700;color:` + TextPrimary + `;line-height:18px;">Community solutions</div>
<p style="margin:2px 0 0;font-size:` + FontBodySmall + `;line-height:16px;color:` + TextSecondary + `;">Browse solutions sorted by likes, runtime, or recency. Full source and stats on every entry.</p>
</td>
</tr>
</table>
</td>
</tr>

<!-- Feature Card 2: Code Analysis -->
<tr>
<td class="card-pad" style="padding:8px 20px 0 20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:` + CardSurface + `;border:1px solid ` + BorderColor + `;border-radius:8px;border-left:2px solid ` + ButtonGold + `;">
<tr>
<td style="padding:10px 12px;">
<div style="font-size:` + FontSubhead + `;font-weight:700;color:` + TextPrimary + `;line-height:18px;">Code analysis</div>
<p style="margin:2px 0 0;font-size:` + FontBodySmall + `;line-height:16px;color:` + TextSecondary + `;">Open any solution for quality, complexity, and technique notes — plus follow-up questions if you need them.</p>
</td>
</tr>
</table>
</td>
</tr>

<!-- Feature Card 3: How to Get Featured -->
<tr>
<td class="card-pad" style="padding:8px 20px 0 20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:` + CardSurface + `;border:1px solid ` + BorderColor + `;border-radius:8px;border-left:2px solid ` + ButtonGold + `;">
<tr>
<td style="padding:10px 12px;">
<div style="font-size:` + FontSubhead + `;font-weight:700;color:` + TextPrimary + `;line-height:18px;">How to Get Featured</div>
<p style="margin:2px 0 0;font-size:` + FontBodySmall + `;line-height:16px;color:` + TextSecondary + `;">Solve problems, share solutions, earn likes — top entries surface in Best Practices.</p>
</td>
</tr>
</table>
</td>
</tr>

<!-- Top Solutions Preview -->
{{if .TopSolutions}}
<tr>
<td class="card-pad" style="padding:16px 20px 0 20px;">
<div style="margin-bottom:6px;"><span style="font-size:` + FontCaption + `;text-transform:uppercase;letter-spacing:0.08em;color:` + TextSecondary + `;font-weight:700;">Top Rated Solutions</span></div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ` + BorderColor + `;border-radius:8px;overflow:hidden;">
{{range $i, $s := .TopSolutions}}
<tr{{if $i}} style="border-top:1px solid ` + BorderColor + `;"{{end}}>
<td style="padding:9px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td>
<div style="font-size:` + FontBody + `;font-weight:600;color:` + TextPrimary + `;line-height:16px;">{{.ProblemTitle}}</div>
<div style="font-size:` + FontCaption + `;color:` + TextSecondary + `;margin-top:1px;line-height:14px;">by {{.UserName}} &middot; {{.Language}}</div>
</td>
<td align="right" style="white-space:nowrap;">
<span style="font-size:` + FontCaption + `;font-weight:700;color:` + ButtonGold + `;">&#9829; {{.Likes}}</span>
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
<td class="card-pad" style="padding:16px 20px 0 20px;text-align:center;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
<tr>
<td style="border-radius:8px;background-color:` + ButtonGold + `;border-bottom:2px solid ` + ButtonGoldDark + `;">
<a href="{{.CTAURL}}" class="btn-cta" style="display:inline-block;padding:10px 22px;font-size:` + FontBody + `;line-height:16px;font-weight:700;color:#121212;text-decoration:none;border-radius:8px;">Explore Best Practices</a>
</td>
</tr>
</table>

</td>
</tr>

<!-- Fallback link -->
<tr>
<td class="card-pad" style="padding:10px 20px 0 20px;">
<div style="font-size:` + FontCaption + `;color:#9CA3AF;line-height:15px;text-align:center;">Or copy this link: <a href="{{.CTAURL}}" style="color:` + ButtonGold + `;text-decoration:none;word-break:break-all;">{{.CTAURL}}</a></div>
</td>
</tr>

<!-- Footer -->
<tr>
<td class="card-pad" style="padding:16px 20px 12px 20px;">

<!-- Divider -->
<div style="height:1px;background-color:` + BorderColor + `;margin-bottom:12px;"></div>

<!-- Signature -->
<div style="margin-bottom:8px;">
<div style="font-size:` + FontBody + `;color:` + TextPrimary + `;font-weight:700;line-height:1.2;">Jerry</div>
<div style="font-size:` + FontCaption + `;color:` + TextSecondary + `;margin-top:1px;">Koder</div>
</div>

<div style="font-size:` + FontBodySmall + `;color:` + TextSecondary + `;line-height:16px;">{{.Tagline}}</div>

<div style="margin-top:8px;font-size:` + FontCaption + `;color:` + TextSecondary + `;line-height:15px;">Questions? <a href="mailto:{{.SupportEmail}}" style="color:` + ButtonGold + `;text-decoration:none;">{{.SupportEmail}}</a></div>

<div style="margin-top:8px;font-size:` + FontCaption + `;line-height:14px;color:#9CA3AF;">&copy; {{.Year}} {{.PlatformName}}. All rights reserved.</div>

</td>
</tr>

{{end}}`
}

var problemReminderTmpl = template.Must(template.New("problem-reminder").Parse(layoutBase + problemReminderBody()))

func problemReminderBody() string {
	return `{{define "content"}}

<!-- Header: logo only (the lockup already contains the wordmark) -->
<tr>
<td class="card-pad" style="padding:12px 20px;" bgcolor="` + EmailBackground + `">
{{.LogoHTML}}
</td>
</tr>

<!-- Header divider -->
<tr><td style="height:1px;background-color:` + BorderColor + `;font-size:0;line-height:0;">&nbsp;</td></tr>

<!-- Hero -->
<tr>
<td class="card-pad" style="padding:16px 20px 0 20px;">

<p style="margin:0 0 8px 0;color:` + TextPrimary + `;font-size:` + FontBody + `;line-height:18px;">Hi <strong style="color:` + TextPrimary + `;">{{.FirstName}}</strong>,</p>

<h1 style="margin:0;font-size:` + FontHeading + `;line-height:22px;color:` + TextPrimary + `;font-weight:700;letter-spacing:-0.2px;">Ready for a quick challenge?</h1>

<p style="margin:5px 0 0;color:` + TextSecondary + `;font-size:` + FontBodySmall + `;line-height:17px;">
Try this problem: <strong style="color:` + TextPrimary + `;">{{.ProblemTitle}}</strong>
</p>

</td>
</tr>

<!-- Problem card & CTA -->
<tr>
<td class="card-pad" style="padding:12px 20px 0 20px;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:` + CardSurface + `;border:1px solid ` + BorderColor + `;border-radius:8px;border-left:2px solid ` + ButtonGold + `;">
<tr>
<td style="padding:12px 14px;color:` + TextPrimary + `;">
<div style="font-size:` + FontSubhead + `;font-weight:700;color:` + TextPrimary + `;margin-bottom:5px;line-height:18px;">{{.ProblemTitle}}</div>
<div style="color:` + TextSecondary + `;margin-bottom:10px;">{{.ProblemExcerptHTML}}</div>
<div>
<a href="{{.CTAURL}}" class="btn-cta" style="display:inline-block;padding:10px 22px;background-color:` + ButtonGold + `;border-bottom:2px solid ` + ButtonGoldDark + `;color:#121212;font-weight:700;border-radius:8px;text-decoration:none;font-size:` + FontBody + `;line-height:16px;">Open Problem</a>
</div>
</td>
</tr>
</table>

</td>
</tr>

<!-- Fallback link -->
<tr>
<td class="card-pad" style="padding:10px 20px 0 20px;">
<div style="font-size:` + FontCaption + `;color:#9CA3AF;line-height:15px;">Or copy this link: <a href="{{.CTAURL}}" style="color:` + ButtonGold + `;text-decoration:none;word-break:break-all;">{{.CTAURL}}</a></div>
</td>
</tr>

<!-- Footer -->
<tr>
<td class="card-pad" style="padding:16px 20px 12px 20px;">

<!-- Divider -->
<div style="height:1px;background-color:` + BorderColor + `;margin-bottom:12px;"></div>

<!-- Signature -->
<div style="margin-bottom:8px;">
<div style="font-size:` + FontBody + `;color:` + TextPrimary + `;font-weight:700;line-height:1.2;">Jerry</div>
<div style="font-size:` + FontCaption + `;color:` + TextSecondary + `;margin-top:1px;">Koder</div>
</div>

<div style="font-size:` + FontBodySmall + `;color:` + TextSecondary + `;line-height:16px;">{{.Tagline}}</div>

<div style="margin-top:8px;font-size:` + FontCaption + `;color:` + TextSecondary + `;line-height:15px;">Questions? <a href="mailto:{{.SupportEmail}}" style="color:` + ButtonGold + `;text-decoration:none;">{{.SupportEmail}}</a></div>

<div style="margin-top:8px;font-size:` + FontCaption + `;line-height:14px;color:#9CA3AF;">&copy; {{.Year}} {{.PlatformName}}. All rights reserved.</div>

</td>
</tr>

{{end}}`
}

// passwordResetTmpl is a reusable document shell (light background, centered
// 560px column, email-safe table markup) with a "content" slot that each email
// type fills. Future templates (verification, welcome, enrollment) reuse the
// same layout by swapping the content definition.
var passwordResetTmpl = template.Must(template.New("password-reset").Parse(
	layoutBase + passwordResetBody,
))

const layoutBase = `{{define "layoutBase"}}<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>{{if .PreviewTitle}}{{.PreviewTitle}}{{else}}{{.PlatformName}}{{end}}</title>
<style type="text/css">
@media only screen and (max-width:600px) {
  .email-outer { padding: 10px 0 !important; }
  .email-card { border-radius: 0 !important; border-left: 0 !important; border-right: 0 !important; }
  .card-pad { padding-left: 14px !important; padding-right: 14px !important; }
  .btn-cta { width: 100% !important; text-align: center !important; }
}
</style>
</head>
<body style="margin:0;padding:0;background-color:#F0F0F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;color:` + TextPrimary + `;">
{{if .PreheaderText}}<div style="display:none;font-size:1px;color:#FFFFFF;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">{{.PreheaderText}}</div>{{end}}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F0F0F0;">
<tr>
<td align="center" class="email-outer" style="padding:20px 12px;">

<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" class="email-card" style="max-width:560px;width:100%;background-color:` + EmailBackground + `;border-radius:10px;overflow:hidden;border:1px solid ` + BorderColor + `;">

<!-- Gold accent strip -->
<tr><td style="background-color:` + ButtonGold + `;height:2px;font-size:0;line-height:0;">&nbsp;</td></tr>

{{template "content" .}}

</table>

</td>
</tr>
</table>

</body>
</html>{{end}}`

const passwordResetBody = `{{define "content"}}

<!-- Header: logo only (the lockup already contains the wordmark) -->
<tr>
<td class="card-pad" style="padding:12px 20px;" bgcolor="` + EmailBackground + `">
{{.LogoHTML}}
</td>
</tr>

<!-- Header divider -->
<tr><td style="height:1px;background-color:` + BorderColor + `;font-size:0;line-height:0;">&nbsp;</td></tr>

<!-- Hero -->
<tr>
<td class="card-pad" style="padding:16px 20px 0 20px;">

<h1 style="margin:0;font-size:` + FontHeading + `;line-height:22px;color:` + TextPrimary + `;font-weight:700;letter-spacing:-0.2px;">Reset your password</h1>

<p style="margin:10px 0 0;color:` + TextPrimary + `;font-size:` + FontBody + `;line-height:18px;">
Hi <strong style="color:` + TextPrimary + `;">{{.FirstName}}</strong>,
</p>

<p style="margin:5px 0 0;color:` + MutedText + `;font-size:` + FontBodySmall + `;line-height:17px;">
We received a request to reset the password for your {{.PlatformName}} account. If you made this request, click the button below to choose a new password.
</p>

</td>
</tr>

<!-- CTA -->
<tr>
<td class="card-pad" style="padding:14px 20px 0 20px;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0;">
<tr>
<td style="border-radius:8px;background-color:` + ButtonGold + `;border-bottom:2px solid ` + ButtonGoldDark + `;">
<a href="{{.ResetURL}}" class="btn-cta" style="display:inline-block;padding:10px 22px;font-size:` + FontBody + `;line-height:16px;font-weight:700;color:#121212;text-decoration:none;border-radius:8px;">Reset Password</a>
</td>
</tr>
</table>

<p style="margin:10px 0 0;font-size:` + FontBodySmall + `;line-height:16px;color:` + TextSecondary + `;">
This link expires in <strong style="color:` + TextPrimary + `;">{{.ExpiresIn}}</strong>.
</p>

</td>
</tr>

<!-- Security note -->
<tr>
<td class="card-pad" style="padding:14px 20px 0 20px;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:` + CardSurface + `;border:1px solid ` + BorderColor + `;border-radius:8px;">
<tr>
<td style="padding:12px 14px;">
<div style="font-size:` + FontSubhead + `;font-weight:700;color:` + TextPrimary + `;line-height:18px;">Didn't request this?</div>
<p style="margin:5px 0 0;color:` + TextSecondary + `;font-size:` + FontBodySmall + `;line-height:16px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
<p style="margin:5px 0 0;color:` + TextSecondary + `;font-size:` + FontBodySmall + `;line-height:16px;">If you believe someone attempted to access your account, we recommend changing your password immediately after signing in.</p>
</td>
</tr>
</table>

</td>
</tr>

<!-- Backup URL -->
<tr>
<td class="card-pad" style="padding:12px 20px 0 20px;">
<div style="font-size:` + FontCaption + `;color:#9CA3AF;line-height:15px;">Or copy this link: <a href="{{.ResetURL}}" style="color:` + ButtonGold + `;text-decoration:none;word-break:break-all;">{{.ResetURL}}</a></div>
</td>
</tr>

<!-- Footer -->
<tr>
<td class="card-pad" style="padding:16px 20px 12px 20px;">

<!-- Divider -->
<div style="height:1px;background-color:` + BorderColor + `;margin-bottom:12px;"></div>

<!-- Signature -->
<div style="margin-bottom:8px;">
<div style="font-size:` + FontBody + `;color:` + TextPrimary + `;font-weight:700;line-height:1.2;">Jerry</div>
<div style="font-size:` + FontCaption + `;color:` + TextSecondary + `;margin-top:1px;">Koder</div>
</div>

<div style="font-size:` + FontBodySmall + `;color:` + TextSecondary + `;line-height:16px;">{{.Tagline}}</div>

<div style="margin-top:8px;font-size:` + FontCaption + `;color:` + TextSecondary + `;line-height:15px;">Questions? <a href="mailto:{{.SupportEmail}}" style="color:` + ButtonGold + `;text-decoration:none;">{{.SupportEmail}}</a></div>

<div style="margin-top:8px;font-size:` + FontCaption + `;line-height:14px;color:#9CA3AF;">&copy; {{.Year}} {{.PlatformName}}. All rights reserved.</div>

</td>
</tr>

{{end}}`
