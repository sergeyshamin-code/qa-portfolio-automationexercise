import { Page, Locator } from '@playwright/test';

export interface AccountDetails {
  password: string;
  day: string;
  month: string;
  year: string;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2?: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
}

/** The full "Enter Account Information" form shown after the mini-signup step. */
export class AccountInfoPage {
  readonly page: Page;
  readonly titleMr: Locator;
  readonly passwordInput: Locator;
  readonly dayJoinSelect: Locator;
  readonly monthSelect: Locator;
  readonly yearSelect: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly companyInput: Locator;
  readonly address1Input: Locator;
  readonly address2Input: Locator;
  readonly countrySelect: Locator;
  readonly stateInput: Locator;
  readonly cityInput: Locator;
  readonly zipcodeInput: Locator;
  readonly mobileNumberInput: Locator;
  readonly createAccountButton: Locator;
  readonly accountCreatedHeading: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleMr = page.locator('#id_gender1');
    this.passwordInput = page.locator('#password');
    this.dayJoinSelect = page.locator('#days');
    this.monthSelect = page.locator('#months');
    this.yearSelect = page.locator('#years');
    this.firstNameInput = page.locator('#first_name');
    this.lastNameInput = page.locator('#last_name');
    this.companyInput = page.locator('#company');
    this.address1Input = page.locator('#address1');
    this.address2Input = page.locator('#address2');
    this.countrySelect = page.locator('#country');
    this.stateInput = page.locator('#state');
    this.cityInput = page.locator('#city');
    this.zipcodeInput = page.locator('#zipcode');
    this.mobileNumberInput = page.locator('#mobile_number');
    this.createAccountButton = page.locator('[data-qa="create-account"]');
    this.accountCreatedHeading = page.locator('[data-qa="account-created"]');
    this.continueButton = page.locator('[data-qa="continue-button"]');
  }

  async fillAndSubmit(details: AccountDetails) {
    await this.titleMr.check();
    await this.passwordInput.fill(details.password);
    await this.dayJoinSelect.selectOption(details.day);
    await this.monthSelect.selectOption(details.month);
    await this.yearSelect.selectOption(details.year);
    await this.firstNameInput.fill(details.firstName);
    await this.lastNameInput.fill(details.lastName);
    await this.companyInput.fill(details.company);
    await this.address1Input.fill(details.address1);
    if (details.address2) await this.address2Input.fill(details.address2);
    await this.countrySelect.selectOption(details.country);
    await this.stateInput.fill(details.state);
    await this.cityInput.fill(details.city);
    await this.zipcodeInput.fill(details.zipcode);
    await this.mobileNumberInput.fill(details.mobileNumber);
    await this.createAccountButton.click();
  }
}
