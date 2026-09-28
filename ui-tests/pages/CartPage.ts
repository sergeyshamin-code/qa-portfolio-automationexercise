import { Page, Locator } from '@playwright/test';
import { dismissCookieConsent } from '../fixtures/cookieConsent';
import { hideAds } from '../fixtures/hideAds';
import { closeInterstitialAd } from '../fixtures/closeInterstitialAd';

/** The `/view_cart` page. */
export class CartPage {
  readonly page: Page;
  readonly rows: Locator;
  readonly proceedToCheckoutButton: Locator;
  readonly checkoutModalLoginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.rows = page.locator('#cart_info tbody tr');
    this.proceedToCheckoutButton = page.locator('.check_out');
    this.checkoutModalLoginLink = page.locator('#checkoutModal a[href="/login"]');
  }

  async goto() {
    await this.page.goto('/view_cart');
    await dismissCookieConsent(this.page);
    await hideAds(this.page);
    await closeInterstitialAd(this.page);
  }

  row(productId: number): Locator {
    return this.page.locator(`#product-${productId}`);
  }

  quantityOf(productId: number): Locator {
    return this.row(productId).locator('.cart_quantity button');
  }

  totalPriceOf(productId: number): Locator {
    return this.row(productId).locator('.cart_total_price');
  }

  removeButton(productId: number): Locator {
    return this.row(productId).locator('.cart_delete a');
  }

  /**
   * Clicks "Proceed To Checkout" and waits for its effect: either the
   * login/register modal (guest) or a direct navigation to /checkout
   * (already logged in). Retries the click a couple of times — on a slower
   * machine (e.g. a CI runner with fewer CPUs than a dev laptop) the click
   * can fire before the site's own JS has finished attaching its handler,
   * so nothing visibly happens the first time.
   */
  async proceedToCheckout() {
    for (let attempt = 1; attempt <= 3; attempt++) {
      await this.proceedToCheckoutButton.click();
      const reachedCheckout = await Promise.race([
        this.checkoutModalLoginLink.waitFor({ state: 'visible', timeout: 5000 }).then(() => true),
        this.page.waitForURL(/\/checkout$/, { timeout: 5000 }).then(() => true),
      ]).catch(() => false);
      if (reachedCheckout) return;
    }
    throw new Error('"Proceed To Checkout" produced neither the login modal nor a navigation to /checkout after 3 attempts');
  }
}
