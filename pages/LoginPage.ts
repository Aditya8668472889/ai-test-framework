import { Page, Locator, expect } from '@playwright/test';
import { InventoryPage } from './InventoryPage';
import { Users } from '../data/users';
import { HealingLocator } from '../utils/healingLocator';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly pageLogo: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.pageLogo = page.locator('.login_logo');
  }

  async goto() {
    // '/' resolves against baseURL from playwright.config.ts (driven by BASE_URL)
    await this.page.goto('/');
  }

  // ---- PRIVATE base action: fill + submit only, NO assertion (rule #3) ----
  private async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  // ---- PUBLIC named scenarios: action + assertion bundled, no args (rules #1, #2) ----

  // Page chaining: a successful login returns the next page object (rule #5)
  async loginAsStandardUser(): Promise<InventoryPage> {
    await this.login(Users.standard.username, Users.standard.password);
    await expect(this.page).toHaveURL(/.*inventory/);
    return new InventoryPage(this.page);
  }

  async verifyWrongPasswordError() {
    await this.login(Users.invalid.username, Users.invalid.password);
    await expect(this.errorMessage).toContainText('Username and password do not match');
  }

  async verifyEmptyUsernameError() {
    await this.login(Users.emptyUsername.username, Users.emptyUsername.password);
    await expect(this.errorMessage).toContainText('Username is required');
  }

  async verifyLockedUserError() {
    await this.login(Users.locked.username, Users.locked.password);
    await expect(this.errorMessage).toContainText('Sorry, this user has been locked out');
  }

  // Self-healing variant: each field is wrapped in a HealingLocator, so if a
  // selector breaks Claude suggests a replacement and the action is retried.
  async loginAsStandardUserWithHealing(): Promise<InventoryPage> {
    const healingUsername = new HealingLocator(this.page, '#user-name', 'username input');
    const healingPassword = new HealingLocator(this.page, '#password', 'password input');
    const healingButton = new HealingLocator(this.page, '#login-button', 'login button');

    await healingUsername.fill(Users.standard.username);
    await healingPassword.fill(Users.standard.password);
    await healingButton.click();
    await expect(this.page).toHaveURL(/.*inventory/);
    return new InventoryPage(this.page);
  }

  // Demo of the heal→retry loop: the username selector is DELIBERATELY broken,
  // so the first fill fails, Claude suggests a working selector, and login still
  // succeeds. Watch the console for the "🔧 Healed" line and healing-log.json.
  async loginWithBrokenSelectorHealing(): Promise<InventoryPage> {
    const healingUsername = new HealingLocator(this.page, '#user-name-BROKEN', 'username input');
    const healingPassword = new HealingLocator(this.page, '#password', 'password input');
    const healingButton = new HealingLocator(this.page, '#login-button', 'login button');

    await healingUsername.fill(Users.standard.username);
    await healingPassword.fill(Users.standard.password);
    await healingButton.click();
    await expect(this.page).toHaveURL(/.*inventory/);
    return new InventoryPage(this.page);
  }
}
