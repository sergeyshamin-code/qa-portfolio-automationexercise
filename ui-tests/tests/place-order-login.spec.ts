import { test, expect } from '../fixtures/base';
import { HomePage } from '../pages/HomePage';
import { SignupLoginPage } from '../pages/SignupLoginPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage, PaymentPage } from '../pages/CheckoutPage';
import { ApiUser, createApiUser, deleteApiUser } from '../fixtures/apiUser';

const baseURL = process.env.AE_BASE_URL ?? 'https://automationexercise.com';

// Test case #16 (Place Order: Login before Checkout). The account used to log
// in is created through the API just for this test (see fixtures/apiUser.ts)
// and deleted again at the end, so the run needs no pre-existing credentials
// and leaves no data behind on the public site.
test.describe('place order after logging in', () => {
  // This is a long, realistic user journey (login, cart, checkout, payment,
  // account deletion, each a real page navigation) — the default 30s test
  // timeout isn't enough for it.
  test.describe.configure({ timeout: 60_000 });

  let user: ApiUser;

  test.beforeAll(async () => {
    user = await createApiUser(baseURL);
  });

  test.afterAll(async () => {
    // Safety net: if the test's own "Delete Account" step didn't run
    // (e.g. an earlier assertion failed), make sure the account is removed.
    await deleteApiUser(baseURL, user);
  });

  test('logs in during checkout and places an order', async ({ page }) => {
    const home = new HomePage(page);
    const signupLogin = new SignupLoginPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    const payment = new PaymentPage(page);

    await home.goto();
    await home.addProductToCartByIndex(0);
    await home.goToCartFromModal();

    await cart.proceedToCheckout();
    await cart.checkoutModalLoginLink.click();
    await signupLogin.login(user.email, user.password);

    await expect(home.loggedInAsText).toContainText(user.name);

    await home.cartLink.click();
    await cart.proceedToCheckout();
    await expect(page).toHaveURL(/\/checkout$/);

    await checkout.orderCommentTextarea.fill('QA portfolio automated order — please ignore.');
    await checkout.placeOrderLink.click();

    await payment.pay({
      nameOnCard: user.name,
      cardNumber: '4111111111111111',
      cvc: '123',
      expiryMonth: '12',
      expiryYear: '2030',
    });

    await expect(payment.confirmationText).toBeVisible();

    await home.goto();
    await home.deleteAccount();
    await expect(page.getByText('Account Deleted!')).toBeVisible();
  });
});
