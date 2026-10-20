package email

import (
	_ "embed"
	"encoding/base64"
	"html/template"
	"strconv"
	"strings"
)

// logoAsset is the Koder logo, derived from frontend/public/logo.png: cropped
// to the artwork's alpha bounds and downscaled to 2x the display size so it
// stays crisp on retina screens (~10 KB).
//
//go:embed assets/logo.png
var logoAsset []byte

const (
	// LogoContentID is the Content-ID used to reference the logo inside the
	// email HTML (src="cid:koder-logo"). It must stay in sync with the inline
	// attachment that carries the image.
	LogoContentID = "koder-logo"
	// LogoFilename is the name the inline attachment is delivered with.
	LogoFilename = "koder-logo.png"
	// LogoDisplayWidth/LogoDisplayHeight are the rendered dimensions in CSS
	// pixels and preserve the artwork's 240x82 (~2.93:1) aspect ratio.
	LogoDisplayWidth  = 120
	LogoDisplayHeight = 41
)

// LogoPNG returns the embedded, email-optimized logo bytes. Callers (and
// tests) use it to attach the same artwork the HTML references by CID.
func LogoPNG() []byte { return logoAsset }

// LogoAttachment returns the Resend attachment object that inlines the logo
// into the message as multipart/related content.
//
// The image travels inside the email itself, so it renders identically in
// every client and never depends on a public asset being reachable, on image
// proxies, or on the sender's FRONTEND_URL being correct.
func LogoAttachment() map[string]string {
	return map[string]string{
		"filename":   LogoFilename,
		"content":    base64.StdEncoding.EncodeToString(logoAsset),
		"content_id": LogoContentID,
	}
}

// EmailAttachments returns the attachment list for a transactional email.
// Returned as []map[string]string so it marshals directly into the Resend API
// payload.
func EmailAttachments() []map[string]string {
	return []map[string]string{LogoAttachment()}
}

// InlineLogoForPreview rewrites the CID reference in rendered markup to an
// inline data URI so the email can be inspected in a browser, which has no
// MIME attachment to resolve the cid: scheme against. Real sends keep the cid:
// reference and carry the image as an inline attachment (see
// EmailAttachments).
func InlineLogoForPreview(htmlBody string) string {
	if !strings.Contains(htmlBody, "cid:"+LogoContentID) {
		return htmlBody
	}
	dataURI := "data:image/png;base64," + base64.StdEncoding.EncodeToString(logoAsset)
	return strings.ReplaceAll(htmlBody, "cid:"+LogoContentID, dataURI)
}

// renderLogoHTML builds the header logo markup. It is a template.HTML value
// because html/template's URL sanitizer rewrites unknown schemes (including
// cid:) to #ZgotmplZ, which would break the image.
//
// Width/height attributes are set explicitly (plus matching inline styles) so
// clients that strip CSS still reserve the correct box and never stretch the
// wide lockup into a square.
func renderLogoHTML() template.HTML {
	w := strconv.Itoa(LogoDisplayWidth)
	h := strconv.Itoa(LogoDisplayHeight)
	return template.HTML(`<img src="cid:` + LogoContentID + `" alt="Koder" width="` + w + `" height="` + h + `" style="display:block;width:` + w + `px;height:` + h + `px;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;" />`)
}
