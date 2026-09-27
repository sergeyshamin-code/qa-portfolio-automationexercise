import { test, expect } from '../fixtures/base';
import { SignupLoginPage } from '../pages/SignupLoginPage';

// Test case #3 (Login User with incorrect email and password).
test('shows an error when logging in with incorrect credentials', async ({ page }) => {
  const signupLogin = new SignupLoginPage(page);

  await signupLogin.goto();
  await signupLogin.login('nobody_xyz@example.com', 'wrong-password');

  await expect(signupLogin.loginErrorText).toBeVisible();
  // Still on the login page — an invalid login must not let the user in.
  await expect(page).toHaveURL(/\/login$/);
});
