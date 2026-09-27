import { Page, Locator } from '@playwright/test';

/** The `/checkout` page: order review, delivery/billing address and the order comment. */
export class CheckoutPage {
  readonly page: Page;
  readonly orderCommentTextarea: Locator;
  readonly placeOrderLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.orderCommentTextarea = page.locator('textarea[name="message"]');
    this.placeOrderLink = page.locator('a', { hasText: 'Place Order' });
  }
}

/** The `/payment` page. */
export class PaymentPage {
  readonly page: Page;
  readonly nameOnCardInput: Locator;
  readonly cardNumberInput: Locator;
  readonly cvcInput: Locator;
  readonly expiryMonthInput: Locator;
  readonly expiryYearInput: Locator;
  readonly payButton: Locator;
  readonly confirmationText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameOnCardInput = page.locator('[name="name_on_card"]');
    this.cardNumberInput = page.locator('[name="card_number"]');
    this.cvcInput = page.locator('[name="cvc"]');
    this.expiryMonthInput = page.locator('[name="expiry_month"]');
    this.expiryYearInput = page.locator('[name="expiry_year"]');
    this.payButton = page.locator('[data-qa="pay-button"]');
    this.confirmationText = page.getByText(/order has been confirmed/i);
  }

  async pay(details: { nameOnCard: string; cardNumber: string; cvc: string; expiryMonth: string; expiryYear: string }) {
    await this.nameOnCardInput.fill(details.nameOnCard);
    await this.cardNumberInput.fill(details.cardNumber);
    await this.cvcInput.fill(details.cvc);
    await this.expiryMonthInput.fill(details.expiryMonth);
    await this.expiryYearInput.fill(details.expiryYear);
    await this.payButton.click();
  }
}
