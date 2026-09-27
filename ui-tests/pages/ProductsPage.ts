import { Page, Locator } from '@playwright/test';
import { dismissCookieConsent } from '../fixtures/cookieConsent';
import { hideAds } from '../fixtures/hideAds';
import { closeInterstitialAd } from '../fixtures/closeInterstitialAd';

/** The `/products` page: full catalogue plus the search box. */
export class ProductsPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchedProductsHeading: Locator;
  readonly productCards: Locator;
  readonly productNames: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('#search_product');
    this.searchButton = page.locator('#submit_search');
    this.searchedProductsHeading = page.locator('h2.title', { hasText: 'Searched Products' });
    this.productCards = page.locator('.product-image-wrapper');
    this.productNames = page.locator('.product-image-wrapper .productinfo p');
  }

  async goto() {
    await this.page.goto('/products');
    await dismissCookieConsent(this.page);
    await hideAds(this.page);
    await closeInterstitialAd(this.page);
  }

  async search(term: string) {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }
}
