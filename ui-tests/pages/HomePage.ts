import { Page, Locator } from '@playwright/test';
import { dismissCookieConsent } from '../fixtures/cookieConsent';
import { hideAds } from '../fixtures/hideAds';
import { closeInterstitialAd } from '../fixtures/closeInterstitialAd';

/**
 * The home page (`/`). Also the base for the shared header/nav actions
 * (signup/login, logout, delete account, cart) that appear on every page.
 */
export class HomePage {
  readonly page: Page;
  readonly signupLoginLink: Locator;
  readonly logoutLink: Locator;
  readonly deleteAccountLink: Locator;
  readonly cartLink: Locator;
  readonly loggedInAsText: Locator;
  readonly productCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.signupLoginLink = page.locator('a[href="/login"]');
    this.logoutLink = page.locator('a[href="/logout"]');
    this.deleteAccountLink = page.locator('a[href="/delete_account"]');
    // Scoped to the header (role="banner", confirmed from live snapshots) so
    // this only matches the nav "Cart" link — a "View Cart" link with the
    // same href can be left behind (hidden) inside a closed add-to-cart
    // modal, which lives outside the header.
    this.cartLink = page.getByRole('banner').locator('a[href="/view_cart"]');
    this.loggedInAsText = page.locator('a', { hasText: 'Logged in as' });
    this.productCards = page.locator('.product-image-wrapper');
  }

  async goto() {
    await this.page.goto('/');
    await dismissCookieConsent(this.page);
    await hideAds(this.page);
    await closeInterstitialAd(this.page);
  }

  /** Adds the Nth product (0-based) shown on the page to the cart. */
  async addProductToCartByIndex(index: number) {
    const card = this.productCards.nth(index);
    await card.locator('.add-to-cart').first().click();
  }

  async continueShoppingFromModal() {
    await this.page.locator('button', { hasText: 'Continue Shopping' }).click();
  }

  async goToCartFromModal() {
    await this.page.locator('.modal-content a', { hasText: 'View Cart' }).click();
  }

  async deleteAccount() {
    // The interstitial ad shows up on a timer, not just right after
    // navigation, so it can appear here even though goto() already checked
    // for one — check again right before the click it would otherwise block.
    await closeInterstitialAd(this.page);
    await this.deleteAccountLink.click();
  }
}
