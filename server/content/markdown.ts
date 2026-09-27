const ALLOWED_TAGS = new Set([
  "p", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li",
  "strong", "b", "em", "i", "u", "s", "br", "blockquote", "pre",
  "code", "a", "img", "span", "figure", "figcaption", "hr",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  img: new Set(["src", "alt", "title", "width", "height"]),
  span: new Set([]),
  p: new Set([]),
  h1: new Set([]), h2: new Set([]), h3: new Set([]), h4: new Set([]), h5: new Set([]), h6: new Set([]),
  ul: new Set([]), ol: new Set([]), li: new Set([]),
  blockquote: new Set([]), pre: new Set([]), code: new Set([]), figure: new Set([]), figcaption: new Set([]),
};

const UNSAFE_URL = /^(javascript|data|vbscript):/i;

function sanitizeUrl(value: string) {
  const trimmed = value.trim();
  if (UNSAFE_URL.test(trimmed)) return "#";
  return trimmed;
}

function sanitizeAttr(name: string, value: string, allowed: Set<string>) {
  if (!allowed.has(name)) return "";
  if (name === "href" || name === "src") return ` ${name}="${sanitizeUrl(value)}"`;
  if (name === "target") return value === "_blank" ? ` target="_blank" rel="noopener noreferrer"` : "";
  return ` ${name}="${value.replace(/"/g, "&quot;")}"`;
}

/**
 * Sanitizes a lightweight HTML string, keeping only an allowlist of tags and
 * attributes so authors can structure article content (headings, paragraphs,
 * lists) without exposing the site to XSS. Unknown tags/attributes are stripped.
 */
export function sanitizeHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g, (match, slash: string, tag: string, attrs: string) => {
      const tagName = tag.toLowerCase();
      if (!ALLOWED_TAGS.has(tagName)) return "";
      if (slash) return `</${tagName}>`;
      const allowedAttrs = ALLOWED_ATTRS[tagName];
      if (!attrs.trim()) return `<${tagName}>`;
      let sanitizedAttrs = "";
      const attrRegex = /([a-zA-Z-]+)="([^"]*)"/g;
      let attrMatch: RegExpExecArray | null;
      while ((attrMatch = attrRegex.exec(attrs)) !== null) {
        sanitizedAttrs += sanitizeAttr(attrMatch[1].toLowerCase(), attrMatch[2], allowedAttrs);
      }
      return `<${tagName}${sanitizedAttrs}>`;
    })
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
}

/**
 * Backwards-compatible sanitizer for plain/markdown text: strips any raw HTML
 * and neutralizes markdown links pointing to unsafe URL schemes.
 */
export function sanitizeMarkdown(value: string) {
  return sanitizeHtml(value).replace(/\]\((?:javascript|data|vbscript):[^)]*\)/gi, "](#)");
}
