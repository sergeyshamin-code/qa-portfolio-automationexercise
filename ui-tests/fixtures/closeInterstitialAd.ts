import { Page } from '@playwright/test';

/**
 * The site occasionally shows a full-page interstitial ad (a different
 * format from the AdSense units hideAds.ts hides — this one is a modal-like
 * overlay with its own "Close" control) that blocks every other click until
 * dismissed. It doesn't always appear, so this is a best-effort no-op when
 * it doesn't.
 */
export async function closeInterstitialAd(page: Page) {
  try {
    await page.getByText('Close', { exact: true }).click({ timeout: 5000 });
  } catch {
    // No interstitial this time — nothing to do.
  }
}
