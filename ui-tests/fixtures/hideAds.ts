import { Page } from '@playwright/test';

/**
 * The site serves real, randomly-positioned AdSense ads. They occasionally
 * overlap page content (e.g. the "Add to cart" confirmation modal) and
 * intercept real clicks at those coordinates — even `force: true` clicks,
 * since the browser still hit-tests by pixel position. Hiding the ad
 * containers removes the flakiness at its source instead of forcing clicks
 * through them.
 */
export async function hideAds(page: Page) {
  await page.addStyleTag({
    content: `
      ins.adsbygoogle, [id*="google_ads_iframe"], [class*="adsbygoogle"] {
        display: none !important;
      }
    `,
  });
}
