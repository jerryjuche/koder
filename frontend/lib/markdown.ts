export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineMd(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong style=\"color:#D4AF37\">$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code style=\"background:rgba(255,255,255,0.05);padding:0.125rem 0.375rem;border-radius:0.25rem;font-size:0.875rem;font-family:monospace;color:#D4AF37\">$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#D4AF37;text-decoration:none">$1</a>');
}

export function renderMarkdown(text: string): string {
  const blocks: string[] = [];

  for (const block of text.split(/\n\s*\n/)) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const lines = trimmed.split("\n");

    if (/^#{1,3}\s/.test(trimmed)) {
      const level = trimmed.match(/^(#{1,3})/)?.[1].length || 1;
      const tag = level === 1 ? "h1" : level === 2 ? "h2" : "h3";
      const content = inlineMd(trimmed.replace(/^#{1,3}\s+/, ""));
      blocks.push(`<${tag} style="font-weight:700;letter-spacing:-0.025em;color:#D1D1D8;margin:1.5rem 0 0.75rem 0;font-size:${level === 1 ? "1.5rem" : level === 2 ? "1.25rem" : "1.125rem"}">${content}</${tag}>`);
      continue;
    }

    if (/^\s*[-*]\s/.test(trimmed)) {
      const items = trimmed
        .split("\n")
        .filter((l) => /^\s*[-*]\s/.test(l))
        .map((l) => `<li style="margin:0.25rem 0;color:rgba(209,209,216,0.9);line-height:1.75">${inlineMd(l.replace(/^\s*[-*]\s+/, ""))}</li>`)
        .join("");
      blocks.push(`<ul style="list-style:disc;padding-left:1.25rem;margin:0.75rem 0">${items}</ul>`);
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const items = trimmed
        .split("\n")
        .filter((l) => /^\d+\.\s/.test(l))
        .map((l) => `<li style="margin:0.25rem 0;color:rgba(209,209,216,0.9);line-height:1.75">${inlineMd(l.replace(/^\d+\.\s+/, ""))}</li>`)
        .join("");
      blocks.push(`<ol style="list-style:decimal;padding-left:1.25rem;margin:0.75rem 0">${items}</ol>`);
      continue;
    }

    const paragraphs = lines
      .filter((l) => l.trim())
      .map((l) => `<p style="margin:0 0 0.75rem 0;color:rgba(209,209,216,0.9);line-height:1.75">${inlineMd(l.trim())}</p>`)
      .join("");
    blocks.push(paragraphs);
  }

  return blocks.join("\n");
}
