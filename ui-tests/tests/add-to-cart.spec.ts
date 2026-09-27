import { test, expect } from '../fixtures/base';
import { HomePage } from '../pages/HomePage';
import { CartPage } from '../pages/CartPage';

// Test case #12 (Add Products in Cart): add two products from the home page
// as a guest (no login needed) and verify both land in the cart with the
// expected quantity.
test('adds two products to the cart and verifies them', async ({ page }) => {
  const home = new HomePage(page);
  const cart = new CartPage(page);

  await home.goto();

  await home.addProductToCartByIndex(0);
  await home.continueShoppingFromModal();

  await home.addProductToCartByIndex(1);
  await home.goToCartFromModal();

  await expect(cart.rows).toHaveCount(2);
  for (const row of await cart.rows.all()) {
    await expect(row.locator('.cart_quantity button')).toHaveText('1');
  }
});
