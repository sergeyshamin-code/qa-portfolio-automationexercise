import { Page, Locator } from '@playwright/test';
import { dismissCookieConsent } from '../fixtures/cookieConsent';
import { hideAds } from '../fixtures/hideAds';
import { closeInterstitialAd } from '../fixtures/closeInterstitialAd';

/** The `/login` page: it hosts both the "New User Signup" mini-form and the "Login" form. */
export class SignupLoginPage {
  readonly page: Page;
  readonly signupNameInput: Locator;
  readonly signupEmailInput: Locator;
  readonly signupButton: Locator;
  readonly loginEmailInput: Locator;
  readonly loginPasswordInput: Locator;
  readonly loginButton: Locator;
  readonly loginErrorText: Locator;
  readonly signupErrorText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.signupNameInput = page.locator('[data-qa="signup-name"]');
    this.signupEmailInput = page.locator('[data-qa="signup-email"]');
    this.signupButton = page.locator('[data-qa="signup-button"]');
    this.loginEmailInput = page.locator('[data-qa="login-email"]');
    this.loginPasswordInput = page.locator('[data-qa="login-password"]');
    this.loginButton = page.locator('[data-qa="login-button"]');
    this.loginErrorText = page.getByText('Your email or password is incorrect!');
    this.signupErrorText = page.getByText('Email Address already exist!');
  }

  async goto() {
    await this.page.goto('/login');
    await dismissCookieConsent(this.page);
    await hideAds(this.page);
    await closeInterstitialAd(this.page);
  }

  /** Fills the mini-signup form; the site then redirects to the full account-info form. */
  async startSignup(name: string, email: string) {
    await this.signupNameInput.fill(name);
    await this.signupEmailInput.fill(email);
    await this.signupButton.click();
  }

  async login(email: string, password: string) {
    await this.loginEmailInput.fill(email);
    await this.loginPasswordInput.fill(password);
    await this.loginButton.click();
  }
}
