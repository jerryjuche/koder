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
	CharcoalBase  = "#121212" // page background
	CharcoalPanel = "#1E1E1E" // content card surface
	CharcoalCard  = "#1A1A1A" // darker panel
	BorderColor   = "#2A2A2A" // borders, dividers
	OffWhite      = "#F5F5F5" // primary text
	MutedText     = "#A3A3A3" // secondary text
	MutedGold     = "#D4AF37" // CTA background
)

// LockIconDataURI is an inline SVG padlock (Lucide-style stroke) encoded as a
// data URI so it renders even when a client blocks external images and needs
// zero network requests. Rendered as a CSS background on the hero badge; the
// bgcolor attribute keeps the circle visible if a client strips CSS images.
const LockIconDataURI = "data:image/svg+xml;charset=utf-8," +
	"%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E" +
	"%3Crect x='3' y='11' width='18' height='11' rx='2' ry='2'/%3E" +
	"%3Cpath d='M7 11V7a5 5 0 0 1 10 0v4'/%3E%3C/svg%3E"

// PasswordResetData is the data model for the password-reset email.
type PasswordResetData struct {
	PlatformName string // display name, e.g. "Koder"
	FirstName    string // recipient's name (auto-escaped)
	ResetURL     string // one-time reset link (auto-escaped)
	LogoURL      string // absolute URL to the platform logo
	SupportEmail string // mailto address
	Tagline      string // one-line brand message (footer)
	ExpiresIn    string // human-readable expiry, e.g. "1 hour"
	Year         int    // copyright year
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
	LogoURL            string
	SupportEmail       string
	Tagline            string
	Year               int
}

// RenderProblemReminder renders a problem reminder email into w.
func RenderProblemReminder(w io.Writer, data ProblemReminderData) error {
	if data.PlatformName == "" {
		data.PlatformName = "Koder"
	}
	if data.Year == 0 {
		data.Year = time.Now().Year()
	}
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
// dark email shell.
func renderMarkdownToHTML(md string) string {
	s := strings.TrimSpace(md)
	// escape raw HTML first
	s = html.EscapeString(s)

	// fenced code blocks ```lang\n...``` -> styled <pre><code>
	codeRe := regexp.MustCompile("(?s)```(?:[a-zA-Z0-9_-]*\\n)?(.*?)```")
	s = codeRe.ReplaceAllStringFunc(s, func(m string) string {
		sub := codeRe.ReplaceAllString(m, "$1")
		return `<pre style="background:` + CharcoalCard + `;padding:14px;border-radius:12px;color:` + OffWhite + `;overflow:auto;font-family:monospace;line-height:1.5;"><code>` + sub + `</code></pre>`
	})

	// Headings
	s = regexp.MustCompile(`(?m)^###\s*(.+)$`).ReplaceAllString(s, `<h3 style="margin:14px 0 6px;color:`+OffWhite+`;font-size:16px;">$1</h3>`)
	s = regexp.MustCompile(`(?m)^##\s*(.+)$`).ReplaceAllString(s, `<h2 style="margin:16px 0 8px;color:`+OffWhite+`;font-size:18px;">$1</h2>`)
	s = regexp.MustCompile(`(?m)^#\s*(.+)$`).ReplaceAllString(s, `<h1 style="margin:18px 0 10px;color:`+OffWhite+`;font-size:22px;">$1</h1>`)

	// Inline code
	s = regexp.MustCompile("`([^`]+)`").ReplaceAllString(s, `<code style="background:`+CharcoalPanel+`;padding:2px 6px;border-radius:6px;color:`+OffWhite+`;font-family:monospace;">$1</code>`)

	// Bold then italics
	s = regexp.MustCompile(`\*\*(.+?)\*\*`).ReplaceAllString(s, `<strong style="color:`+OffWhite+`;">$1</strong>`)
	s = regexp.MustCompile(`\*(.+?)\*`).ReplaceAllString(s, `<em style="color:`+MutedText+`;">$1</em>`)

	// Links [text](url)
	s = regexp.MustCompile(`\[([^\]]+)\]\(([^)]+)\)`).ReplaceAllString(s, `<a href="$2" style="color:`+MutedGold+`;text-decoration:none;">$1</a>`)

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
			out = append(out, `<li style="margin-bottom:8px;color:`+OffWhite+`;">`+item+`</li>`)
		} else {
			if inList {
				out = append(out, `</ul>`)
				inList = false
			}
			if trimmed == "" {
				out = append(out, "")
			} else {
				out = append(out, `<p style="margin:10px 0;color:`+MutedText+`;line-height:1.7;">`+trimmed+`</p>`)
			}
		}
	}
	if inList {
		out = append(out, `</ul>`)
	}
	return strings.Join(out, "\n")
}

var problemReminderTmpl = template.Must(template.New("problem-reminder").Parse(layoutBase + problemReminderBody()))

func problemReminderBody() string {
	return `{{define "content"}}

<!-- Header band -->
<tr>
<td style="background-color:` + CharcoalBase + `;padding:24px 20px;" bgcolor="` + CharcoalBase + `">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="left">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td style="vertical-align:middle;">
<img src="{{.LogoURL}}" alt="{{.PlatformName}}" width="40" height="40" style="display:block;width:40px;height:40px;border:0;border-radius:10px;" />
</td>
<td style="width:12px;">&nbsp;</td>
<td style="vertical-align:middle;">
<div style="font-size:20px;font-weight:700;color:` + OffWhite + `;letter-spacing:-0.3px;">{{.PlatformName}}</div>
<div style="margin-top:4px;color:` + MutedText + `;font-size:12px;">{{.Tagline}}</div>
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
<td style="padding:32px 20px 0 20px;">

<h1 style="margin:0;font-size:28px;line-height:38px;color:` + OffWhite + `;font-weight:700;letter-spacing:-0.3px;">Ready for a quick challenge?</h1>

<p style="margin:18px 0 0;color:` + MutedText + `;font-size:16px;line-height:26px;">
Sharpen your skills with this short exercise: <strong style="color:` + OffWhite + `;">{{.ProblemTitle}}</strong>
</p>

</td>
</tr>

<!-- Problem card & CTA -->
<tr>
<td style="padding:24px 20px 0 20px;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:` + CharcoalCard + `;border:1px solid ` + BorderColor + `;border-radius:16px;">
<tr>
<td style="padding:26px;color:` + OffWhite + `;font-size:14px;line-height:22px;">
<div style="font-size:18px;font-weight:700;color:` + OffWhite + `;margin-bottom:10px;">{{.ProblemTitle}}</div>
<div style="font-size:14px;color:` + MutedText + `;margin-bottom:20px;line-height:24px;">{{.ProblemExcerptHTML}}</div>
<div>
<a href="{{.CTAURL}}" style="display:inline-block;padding:14px 24px;background-color:` + MutedGold + `;color:#121212;font-weight:700;border-radius:12px;text-decoration:none;">Open Problem</a>
</div>
</td>
</tr>
</table>

</td>
</tr>

<!-- Fallback link -->
<tr>
<td style="padding:20px 20px 0 20px;">
<div style="background-color:` + CharcoalPanel + `;border:1px solid ` + BorderColor + `;border-radius:14px;padding:18px;">
<div style="font-size:13px;color:` + MutedText + `;margin-bottom:10px;font-weight:600;">Button not working?</div>
<div style="word-break:break-all;font-size:14px;line-height:22px;color:` + OffWhite + `;"><a href="{{.CTAURL}}" style="color:` + MutedGold + `;text-decoration:none;">{{.CTAURL}}</a></div>
</div>
</td>
</tr>

<!-- Footer -->
<tr>
<td style="padding:32px 20px 36px 20px;background-color:` + CharcoalCard + `;border-top:1px solid ` + BorderColor + `;" bgcolor="` + CharcoalCard + `">

<div style="font-size:14px;color:` + OffWhite + `;font-weight:600;">{{.PlatformName}}</div>
<div style="margin-top:10px;font-size:13px;line-height:20px;color:` + MutedText + `;">{{.Tagline}}</div>
<div style="margin-top:14px;font-size:13px;line-height:20px;color:` + MutedText + `;">Need help? <a href="mailto:{{.SupportEmail}}" style="color:` + MutedGold + `;text-decoration:none;">{{.SupportEmail}}</a></div>
<div style="margin-top:16px;font-size:12px;line-height:18px;color:` + MutedText + `;">&copy; {{.Year}} {{.PlatformName}}. All rights reserved.</div>

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
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>{{.PlatformName}}</title>
</head>
<body style="margin:0;padding:0;background-color:` + CharcoalBase + `;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:` + OffWhite + `;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:` + CharcoalBase + `;padding:32px 16px;">
<tr>
<td align="center">

<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:` + CharcoalBase + `;border-radius:20px;overflow:hidden;">

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
<td style="background-color:` + CharcoalCard + `;padding:28px 20px;" bgcolor="` + CharcoalCard + `">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="left">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td style="vertical-align:middle;">
<img src="{{.LogoURL}}" alt="{{.PlatformName}}" width="44" height="44" style="display:block;width:44px;height:44px;border:0;border-radius:12px;" />
</td>
<td style="width:14px;">&nbsp;</td>
<td style="vertical-align:middle;">
<div style="font-size:26px;font-weight:700;color:` + OffWhite + `;letter-spacing:-0.5px;">{{.PlatformName}}</div>
<div style="margin-top:4px;color:` + MutedText + `;font-size:13px;letter-spacing:0.3px;">{{.Tagline}}</div>
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
<td style="padding:34px 20px 0 20px;">

<div style="width:72px;height:72px;border-radius:50%;background-color:` + CharcoalPanel + `;display:block;margin-bottom:24px;border:1px solid ` + BorderColor + `;text-align:center;line-height:72px;">
<img src="{{.LogoURL}}" alt="{{.PlatformName}}" width="48" height="48" style="display:inline-block;width:48px;height:48px;border:0;border-radius:10px;vertical-align:middle;" />
</div>

<h1 style="margin:0;font-size:32px;line-height:40px;color:` + OffWhite + `;font-weight:700;letter-spacing:-0.3px;">Reset your password</h1>

<p style="margin:20px 0 0;color:` + OffWhite + `;font-size:16px;line-height:28px;">
Hi <strong style="color:` + OffWhite + `;">{{.FirstName}}</strong>,
</p>

<p style="margin:12px 0 0;color:` + MutedText + `;font-size:16px;line-height:28px;">
We received a request to reset the password for your {{.PlatformName}} account.
</p>

<p style="margin:12px 0 0;color:` + MutedText + `;font-size:16px;line-height:28px;">
If you made this request, click the button below to choose a new password.
</p>

</td>
</tr>

<!-- CTA -->
<tr>
<td style="padding:28px 20px 0 20px;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0;">
<tr>
<td style="border-radius:14px;background-color:` + MutedGold + `;">
<a href="{{.ResetURL}}" style="display:inline-block;padding:16px 32px;font-size:16px;font-weight:700;color:#121212;text-decoration:none;border-radius:14px;letter-spacing:0.2px;">Reset Password</a>
</td>
</tr>
</table>

<p style="margin-top:24px;margin-bottom:0;font-size:14px;line-height:24px;color:` + MutedText + `;">
This secure link expires in <strong style="color:` + OffWhite + `;">{{.ExpiresIn}}</strong>.
</p>

</td>
</tr>

<!-- Security -->
<tr>
<td style="padding:32px 20px 0 20px;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:` + CharcoalCard + `;border:1px solid ` + BorderColor + `;border-radius:16px;">
<tr>
<td style="padding:24px;color:` + OffWhite + `;font-size:15px;line-height:26px;">
<h2 style="margin:0;font-size:20px;color:` + OffWhite + `;font-weight:700;">Didn't request this?</h2>
<p style="margin:18px 0 0;color:` + MutedText + `;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
<p style="margin:14px 0 0;color:` + MutedText + `;">If you believe someone attempted to access your account, we recommend changing your password immediately after signing in and reviewing your recent account activity.</p>
</td>
</tr>
</table>

</td>
</tr>

<!-- Backup URL -->
<tr>
<td style="padding:28px 20px 0 20px;">

<div style="background-color:` + CharcoalPanel + `;border:1px solid ` + BorderColor + `;border-radius:14px;padding:20px;">
<div style="font-size:13px;color:` + MutedText + `;margin-bottom:12px;font-weight:600;">Button not working?</div>
<div style="word-break:break-all;font-size:14px;line-height:22px;color:` + OffWhite + `;"><a href="{{.ResetURL}}" style="color:` + MutedGold + `;text-decoration:none;">{{.ResetURL}}</a></div>
</div>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="padding:28px 20px 36px 20px;background-color:` + CharcoalCard + `;border-top:1px solid ` + BorderColor + `;" bgcolor="` + CharcoalCard + `">

<div style="font-size:14px;color:` + OffWhite + `;font-weight:600;">{{.PlatformName}}</div>
<div style="margin-top:12px;font-size:13px;line-height:22px;color:` + MutedText + `;">{{.Tagline}}</div>
<div style="margin-top:18px;font-size:13px;line-height:22px;color:` + MutedText + `;">Need help? <a href="mailto:{{.SupportEmail}}" style="color:` + MutedGold + `;text-decoration:none;">{{.SupportEmail}}</a></div>
<div style="margin-top:18px;font-size:12px;line-height:20px;color:` + MutedText + `;">&copy; {{.Year}} {{.PlatformName}}. All rights reserved.</div>

</td>
</tr>

{{end}}`
