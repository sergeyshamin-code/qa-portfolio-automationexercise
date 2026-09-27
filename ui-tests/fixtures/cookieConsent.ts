import { Page } from '@playwright/test';

/**
 * The site shows a Google "Funding Choices" cookie-consent dialog on first
 * load; it overlays the whole page and blocks clicks until dismissed. It
 * only appears once per browser context, so page objects call this right
 * after navigating and it's a no-op on subsequent page loads.
 */
export async function dismissCookieConsent(page: Page) {
  try {
    await page.getByRole('button', { name: 'Consent' }).click({ timeout: 5000 });
  } catch {
    // Banner didn't show (already dismissed this session) — nothing to do.
  }
}
