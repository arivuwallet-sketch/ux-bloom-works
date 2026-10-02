// Shared, browser-safe classification of project files.
// "Support" files are kept for context (SEO Agent, framework detection, ZIP export)
// but are never visually redesigned.

const SUPPORT_FILE_PATTERN =
  /(^|\/)(?:package\.json|composer\.json|components\.json|manifest\.json|vercel\.json|tsconfig[\w.-]*\.json|jsconfig[\w.-]*\.json|[\w.-]+\.config\.(?:js|cjs|mjs|ts|mts|cts)|robots\.txt|llms\.txt|sitemap[\w.-]*\.xml|\.htaccess|_redirects|_headers|[\w.-]+\.webmanifest|[\w.-]+\.ya?ml|[\w.-]+\.toml)$/i;

export function normalizeProjectPath(value: string) {
  return value.replace(/\\/g, "/").replace(/^\.\/+/, "").replace(/^\/+/, "");
}

export function isSupportFile(name: string) {
  return SUPPORT_FILE_PATTERN.test(normalizeProjectPath(name));
}
