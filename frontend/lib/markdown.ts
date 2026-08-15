export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function inlineMd(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#D4AF37">$1</strong>')
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\$([^$\n]+?)\$/g, "<code style=\"background:rgba(255,255,255,0.05);padding:0.125rem 0.375rem;border-radius:0.25rem;font-size:0.875rem;font-family:monospace;color:#D4AF37\">$1</code>")
    .replace(/`(.+?)`/g, "<code style=\"background:rgba(255,255,255,0.05);padding:0.125rem 0.375rem;border-radius:0.25rem;font-size:0.875rem;font-family:monospace;color:#D4AF37\">$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#D4AF37;text-decoration:none">$1</a>');
}

const FENCE_RE = /^\s*(`{3,}|~{3,})\s*([a-zA-Z0-9_+-]*)\s*$/;
const H_RE = /^(#{1,6})\s+(.*)$/;
const UL_ITEM_RE = /^\s*[-*+]\s+(.*)$/;
const OL_ITEM_RE = /^\s*\d+\.\s+(.*)$/;
const QUOTE_RE = /^\s*>\s?(.*)$/;
const HR_RE = /^\s*([-*_])\s*(\1\s*){2,}$/;

const P_STYLE = "margin:0 0 0.75rem 0;color:rgba(209,209,216,0.9);line-height:1.75";
const LI_STYLE = "margin:0.25rem 0;color:rgba(209,209,216,0.9);line-height:1.75";
const CODE_STYLE = "font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:0.8125rem;line-height:1.6;color:#D1D1D8";

function quoteBlock(quote: string[]): string {
  return `<blockquote style="border-left:3px solid #D4AF37;margin:0.875rem 0;padding:0.5rem 0.875rem;color:rgba(209,209,216,0.85);font-style:italic;background:rgba(212,175,55,0.06);border-radius:0 0.375rem 0.375rem 0">${quote
    .map((l) => `<p style="margin:0 0 0.375rem 0">${inlineMd(l)}</p>`)
    .join("")}</blockquote>`;
}

function renderFence(lang: string, code: string): string {
  const caption =
    lang.length > 0
      ? `<div style="display:flex;align-items:center;justify-content:space-between;padding:0.375rem 0.875rem;background:rgba(255,255,255,0.04);border-bottom:1px solid rgba(255,255,255,0.07);font-family:monospace;font-size:0.6875rem;letter-spacing:0.08em;text-transform:uppercase;color:#88889A">${escapeHtml(lang)}</div>`
      : "";
  return `<div style="margin:0.875rem 0;border-radius:0.5rem;overflow:hidden;border:1px solid rgba(255,255,255,0.08)">${caption}<pre style="margin:0;padding:0.875rem 1rem;overflow-x:auto;background:#0F1115;${CODE_STYLE}"><code>${escapeHtml(code)}</code></pre></div>`;
}

export function renderMarkdown(text: string): string {
  if (!text) return "";

  const blocks: string[] = [];
  const lines = text.split("\n");

  let paragraph: string[] = [];
  let list: { content: string; ordered: boolean }[] = [];
  let listOrdered = false;
  let quote: string[] = [];
  let fenceLang: string | null = null;
  let fenceCode: string[] = [];

  const flushParagraph = (): void => {
    const content = paragraph.map((l) => l.trim()).filter(Boolean).join(" ");
    paragraph = [];
    if (content) blocks.push(`<p style="${P_STYLE}">${inlineMd(content)}</p>`);
  };

  const flushList = (): void => {
    if (list.length === 0) return;
    const tag = list[0].ordered ? "ol" : "ul";
    const style = list[0].ordered
      ? "list-style:decimal;padding-left:1.25rem;margin:0.75rem 0"
      : "list-style:disc;padding-left:1.25rem;margin:0.75rem 0";
    blocks.push(
      `<${tag} style="${style}">${list
        .map((it) => `<li style="${LI_STYLE}">${inlineMd(it.content)}</li>`)
        .join("")}</${tag}>`,
    );
    list = [];
  };

  const flushQuote = (): void => {
    if (quote.length > 0) {
      blocks.push(quoteBlock(quote));
      quote = [];
    }
  };

  const flushPending = (): void => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");

    // Fenced code block.
    if (fenceLang !== null) {
      if (FENCE_RE.test(line)) {
        blocks.push(renderFence(fenceLang, fenceCode.join("\n")));
        fenceLang = null;
        fenceCode = [];
      } else {
        fenceCode.push(line);
      }
      continue;
    }
    if (FENCE_RE.test(line)) {
      flushPending();
      fenceLang = FENCE_RE.exec(line)![2] || "";
      fenceCode = [];
      continue;
    }

    // Blank line — close any open block.
    if (line.trim() === "") {
      flushPending();
      continue;
    }

    // Horizontal rule.
    if (HR_RE.test(line)) {
      flushPending();
      blocks.push('<hr style="border:0;border-top:1px solid rgba(255,255,255,0.1);margin:1rem 0">');
      continue;
    }

    // Blockquote.
    if (QUOTE_RE.test(line)) {
      flushParagraph();
      flushList();
      quote.push(QUOTE_RE.exec(line)![1]);
      continue;
    }

    // Heading.
    if (H_RE.test(line)) {
      flushPending();
      const m = H_RE.exec(line)!;
      const level = m[1].length;
      const size = level === 1 ? "1.5rem" : level === 2 ? "1.25rem" : level === 3 ? "1.125rem" : level === 4 ? "1rem" : "0.875rem";
      blocks.push(`<h${level} style="font-weight:700;letter-spacing:-0.025em;color:#D1D1D8;margin:1.5rem 0 0.75rem 0;font-size:${size}">${inlineMd(m[2])}</h${level}>`);
      continue;
    }

    // List items — group consecutive items of the same type.
    const ulMatch = UL_ITEM_RE.exec(line);
    const olMatch = OL_ITEM_RE.exec(line);
    if (ulMatch || olMatch) {
      flushParagraph();
      const ordered = Boolean(olMatch);
      const content = (olMatch || ulMatch)![1].trim();
      if (list.length > 0 && listOrdered !== ordered) {
        flushList();
      }
      listOrdered = ordered;
      list.push({ content, ordered });
      continue;
    }
    if (list.length > 0) flushList();
    flushQuote();

    // Plain paragraph line.
    paragraph.push(line);
  }

  if (fenceLang !== null) {
    blocks.push(renderFence(fenceLang, fenceCode.join("\n")));
  }
  flushPending();

  return blocks.join("\n");
}
