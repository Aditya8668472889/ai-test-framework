import { Page, Locator, expect } from '@playwright/test';

export class TheinternetPage {
  readonly page: Page;
  readonly pageHeading: Locator;
  readonly formAuthLink: Locator;
  readonly checkboxesLink: Locator;
  readonly dropdownLink: Locator;
  readonly dynamicLoadingLink: Locator;
  readonly dropdownSelect: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHeading = page.locator('h1');
    this.formAuthLink = page.locator('a[href="/login"]');
    this.checkboxesLink = page.locator('a[href="/checkboxes"]');
    this.dropdownLink = page.locator('a[href="/dropdown"]');
    this.dynamicLoadingLink = page.locator('a[href="/dynamic_loading"]');
    this.dropdownSelect = page.locator('#dropdown');
  }

  async goto() {
    await this.page.goto('https://the-internet.herokuapp.com');
  }

  async verifyHomePageLoads() {
    await expect(this.pageHeading).toContainText('Welcome to the-internet');
  }

  async navigateToFormAuthPage() {
    await this.formAuthLink.click();
    await expect(this.page).toHaveURL(/\/login/);
  }

  async verifyCheckboxesPage() {
    await this.checkboxesLink.click();
    const checkboxes = this.page.locator('input[type="checkbox"]');
    await expect(checkboxes.first()).toBeVisible();
  }

  async verifyDropdownPage() {
    await this.dropdownLink.click();
    await this.dropdownSelect.selectOption('1');
    await expect(this.dropdownSelect).toHaveValue('1');
  }

  async verifyDynamicLoadingPage() {
    await this.dynamicLoadingLink.click();
    await expect(this.page).toHaveURL(/\/dynamic_loading/);
  }
}