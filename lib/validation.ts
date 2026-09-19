// Small server-side validation helpers shared by the public form API routes.
// (The browser already has `required` / type="email", but never trust the browser.)

export function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function isEmail(value: string): boolean {
  return value.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Simple honeypot: real users never fill the hidden "website" field, bots often do.
export function looksLikeBot(body: Record<string, unknown>): boolean {
  return typeof body.website === "string" && body.website.trim() !== "";
}
