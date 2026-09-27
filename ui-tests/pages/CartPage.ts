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
}
