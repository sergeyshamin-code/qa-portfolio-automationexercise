import { test as base, expect } from '@playwright/test';

/**
 * The site serves real ads and a cookie-consent dialog through Google's ad
 * stack — confirmed live: pagead2.googlesyndication.com (AdSense, including
 * the full-page interstitial format) and fundingchoicesmessages.google.com
 * (the consent dialog). Reactively closing whatever ad format shows up
 * (see cookieConsent.ts / hideAds.ts / closeInterstitialAd.ts) can't keep up
 * with an ad that appears on its own timer mid-test, so this blocks the
 * whole ad stack at the network level instead — it never loads, so nothing
 * needs dismissing. Those reactive helpers stay in place as a harmless
 * fallback in case a future ad format slips through a different domain.
 */
const BLOCKED_HOST_PATTERNS = [
  /(^|\.)googlesyndication\.com$/,
  /(^|\.)doubleclick\.net$/,
  /(^|\.)googletagservices\.com$/,
  /(^|\.)adservice\.google\./,
  /(^|\.)fundingchoicesmessages\.google\.com$/,
];

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route('**/*', (route) => {
      let hostname: string;
      try {
        hostname = new URL(route.request().url()).hostname;
      } catch {
        return route.continue();
      }
      if (BLOCKED_HOST_PATTERNS.some((pattern) => pattern.test(hostname))) {
        return route.abort();
      }
      return route.continue();
    });
    await use(page);
  },
});

export { expect };
