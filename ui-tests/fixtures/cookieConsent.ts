import { Page } from '@playwright/test';

/**
 * The site shows a Google "Funding Choices" cookie-consent dialog on first
 * load; it overlays the whole page and blocks clicks until dismissed.
 *
 * base.ts already blocks the domain that serves it at the network level, so
 * in practice this is now a guaranteed no-op — kept as a cheap fallback in
 * case that blocklist ever misses it. The short timeout matters: a Playwright
 * HTML report trace showed this burning a full 5s per navigation waiting for
 * a banner that network blocking already prevents from ever loading.
 */
export async function dismissCookieConsent(page: Page) {
  try {
    await page.getByRole('button', { name: 'Consent' }).click({ timeout: 500 });
  } catch {
    // Banner didn't show (already dismissed this session) — nothing to do.
  }
}
