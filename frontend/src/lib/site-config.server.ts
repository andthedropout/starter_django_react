
export interface SiteConfig {
  /** Absolute public origin without a trailing slash. */
  siteUrl: string
}

/**
 * The public origin is a runtime deployment value (SITE_URL), never baked into the client
 * bundle. Falling back to the request origin keeps canonical/sitemap URLs correct in local
 * development and in any environment where SITE_URL was not configured.
 */
export function readSiteUrl(): string | null {
  const configured = process.env.SITE_URL?.trim()
  return configured ? configured.replace(/\/+$/, '') : null
}

