import { test, expect } from '../fixtures/base';
import { HomePage } from '../pages/HomePage';
import { SignupLoginPage } from '../pages/SignupLoginPage';
import { AccountInfoPage } from '../pages/AccountInfoPage';

// Test case #1 (Register User): register a brand new account, then delete it
// through the UI as the site's own canonical flow expects — leaves nothing
// behind on the public site.
test('registers a new user account and deletes it afterwards', async ({ page }) => {
  const home = new HomePage(page);
  const signupLogin = new SignupLoginPage(page);
  const accountInfo = new AccountInfoPage(page);

  const uniqueEmail = `ae_ui_${Date.now()}@example.com`;
  const name = 'QA Portfolio User';

  await home.goto();
  await home.signupLoginLink.click();
  await signupLogin.startSignup(name, uniqueEmail);

  await accountInfo.fillAndSubmit({
    password: 'Test@12345',
    day: '1',
    month: 'January',
    year: '1990',
    firstName: 'Test',
    lastName: 'User',
    company: 'QA Portfolio',
    address1: '1 Test Street',
    // The site's country <select> only offers a fixed list of 7 countries
    // (confirmed live — "Poland" isn't one of them), unlike the API's
    // createAccount, which accepts any free-text country.
    country: 'Canada',
    state: 'Ontario',
    city: 'Toronto',
    zipcode: 'M5V 2T6',
    mobileNumber: '123456789',
  });

  await expect(accountInfo.accountCreatedHeading).toBeVisible();
  await accountInfo.continueButton.click();

  await expect(home.loggedInAsText).toContainText(name);

  await home.deleteAccount();
  await expect(page.getByText('Account Deleted!')).toBeVisible();
});
