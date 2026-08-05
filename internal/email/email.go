// Package email renders the project's transactional email templates. All
// templates use the HTML table layout + inline CSS pattern for maximum
// compatibility across major email clients (Gmail, Outlook, Apple Mail).
//
// html/template auto-escapes every user-supplied value (recipient name, URLs)
// so templates can never be used for HTML injection.
package email

import (
	"bytes"
	"html/template"
	"io"
	"strings"
	"time"
)

// Brand tokens (mirrored from frontend/app/globals.css).
const (
	CharcoalBase     = "#141414" // page background
	CharcoalPanel    = "#191919" // footer surface
	CharcoalCard     = "#1E1E1E" // card surface
	BorderColor      = "#2B2B2B" // borders, dividers
	OffWhite         = "#D1D1D8" // primary text
	MutedText        = "#88889A" // secondary text
	BrandPurpleDark  = "#53389E" // gradient start
	BrandPurple      = "#7F56D9" // gradient mid / accents
	BrandPurpleLight = "#9E77ED" // gradient end / links
	MutedGold        = "#D4AF37" // CTA background
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
<title>{{.PlatformName}} — Password Reset</title>
</head>
<body style="margin:0;padding:0;background-color:#141414;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#D1D1D8;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#141414;padding:40px 16px;">
<tr>
<td align="center">

<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#1E1E1E;border:1px solid #2B2B2B;border-radius:18px;overflow:hidden;">

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
<td style="background-image:linear-gradient(135deg,#53389E,#7F56D9,#9E77ED);padding:36px 48px;" bgcolor="#7F56D9">
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
<div style="font-size:26px;font-weight:700;color:#FFFFFF;letter-spacing:-0.5px;">{{.PlatformName}}</div>
<div style="margin-top:2px;color:rgba(255,255,255,.8);font-size:13px;letter-spacing:0.3px;">Coding Practice &amp; Grading</div>
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
<td style="padding:48px 48px 8px 48px;">

<div style="width:72px;height:72px;border-radius:50%;background-color:#7F56D9;background-image:url('{{__LOCK_ICON__}}');background-repeat:no-repeat;background-position:center;background-size:32px 32px;margin-bottom:28px;" bgcolor="#7F56D9">&nbsp;</div>

<h1 style="margin:0;font-size:32px;line-height:40px;color:#FFFFFF;font-weight:700;letter-spacing:-0.3px;">Reset your password</h1>

<p style="margin:20px 0 0;color:#D1D1D8;font-size:16px;line-height:28px;">
Hi <strong style="color:#FFFFFF;">{{.FirstName}}</strong>,
</p>

<p style="margin:8px 0 0;color:#88889A;font-size:16px;line-height:28px;">
We received a request to reset the password for your {{.PlatformName}} account.
</p>

<p style="margin:8px 0 0;color:#88889A;font-size:16px;line-height:28px;">
If you made this request, click the button below to choose a new password.
</p>

</td>
</tr>

<!-- CTA -->
<tr>
<td style="padding:32px 48px 0 48px;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0;">
<tr>
<td style="border-radius:12px;background-color:#D4AF37;">
<a href="{{.ResetURL}}" style="display:inline-block;padding:18px 34px;font-size:16px;font-weight:600;color:#141414;text-decoration:none;border-radius:12px;letter-spacing:0.2px;">Reset Password</a>
</td>
</tr>
</table>

<p style="margin-top:28px;margin-bottom:0;font-size:14px;line-height:24px;color:#88889A;">
This secure link expires in <strong style="color:#FFFFFF;">{{.ExpiresIn}}</strong>.
</p>

</td>
</tr>

<!-- Divider -->
<tr>
<td style="padding:40px 48px 0 48px;">
<hr style="border:none;border-top:1px solid #2B2B2B;margin:0;">
</td>
</tr>

<!-- Security -->
<tr>
<td style="padding:36px 48px 0 48px;">

<h2 style="margin:0;font-size:20px;color:#FFFFFF;font-weight:700;">Didn't request this?</h2>

<p style="margin:14px 0 0;font-size:15px;line-height:28px;color:#88889A;">
If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
</p>

<p style="margin:8px 0 0;font-size:15px;line-height:28px;color:#88889A;">
If you believe someone attempted to access your account, we recommend changing your password immediately after signing in and reviewing your recent account activity.
</p>

</td>
</tr>

<!-- Backup URL -->
<tr>
<td style="padding:28px 48px 0 48px;">

<div style="background-color:#191919;border:1px solid #2B2B2B;border-radius:12px;padding:20px;">

<div style="font-size:13px;color:#88889A;margin-bottom:12px;font-weight:600;">Button not working?</div>

<div style="word-break:break-all;font-size:14px;line-height:24px;color:#9E77ED;">
<a href="{{.ResetURL}}" style="color:#9E77ED;text-decoration:none;word-break:break-all;">{{.ResetURL}}</a>
</div>

</div>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="padding:40px 48px 36px 48px;background-color:#191919;border-top:1px solid #2B2B2B;" bgcolor="#191919">

<div style="font-size:14px;color:#D1D1D8;font-weight:600;">{{.PlatformName}}</div>

<div style="margin-top:12px;font-size:14px;line-height:24px;color:#88889A;">{{.Tagline}}</div>

<div style="margin-top:24px;font-size:13px;line-height:22px;color:#88889A;">
Need help? <a href="mailto:{{.SupportEmail}}" style="color:#9E77ED;text-decoration:none;">{{.SupportEmail}}</a>
</div>

<div style="margin-top:18px;font-size:12px;line-height:22px;color:#5B5B66;">
&copy; {{.Year}} {{.PlatformName}}. All rights reserved.
</div>

</td>
</tr>

{{end}}`
