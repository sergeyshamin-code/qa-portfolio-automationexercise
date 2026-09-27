import { test, expect } from '../fixtures/base';
import { ProductsPage } from '../pages/ProductsPage';

// Test case #9 (Search Product).
//
// Note: the site's search matches more than just the product name (e.g.
// searching "top" can surface products categorised under "Tops" whose name
// doesn't literally contain the word — confirmed live). That exact matching
// behaviour is already covered at the API layer (api-tests/), which checks
// the raw response; this UI test instead verifies the search *feature*
// works end-to-end: a term produces a non-empty, rendered results page.
test('searching for a product shows results', async ({ page }) => {
  const products = new ProductsPage(page);

  await products.goto();
  await products.search('top');

  await expect(products.searchedProductsHeading).toBeVisible();

  const count = await products.productCards.count();
  expect(count).toBeGreaterThan(0);

  const names = await products.productNames.allTextContents();
  expect(names.every((name) => name.trim().length > 0)).toBe(true);
});
