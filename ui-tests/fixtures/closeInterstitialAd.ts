import { Page } from '@playwright/test';

/**
 * The site occasionally shows a full-page interstitial ad (a different
 * format from the AdSense units hideAds.ts hides — this one is a modal-like
 * overlay with its own "Close" control) that blocks every other click until
 * dismissed.
 *
 * base.ts's network-level blocking appears to cover this format too — it
 * hasn't recurred across many runs since that was added — so, as with
 * cookieConsent.ts, this is kept only as a cheap fallback with a short
 * timeout rather than the 5s it used to burn on every check.
 */
export async function closeInterstitialAd(page: Page) {
  try {
    await page.getByText('Close', { exact: true }).click({ timeout: 500 });
  } catch {
    // No interstitial this time — nothing to do.
  }
}
