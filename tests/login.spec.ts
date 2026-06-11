import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login Page', () => {

  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should login successfully with valid credentials', async () => {
    await loginPage.loginAsStandardUser();
  });

  test('should show error with wrong password', async () => {
    await loginPage.verifyWrongPasswordError();
  });

  test('should show error when username is empty', async () => {
    await loginPage.verifyEmptyUsernameError();
  });

  test('Verify error message for locked out user', async () => {
    await loginPage.verifyLockedUserError();
  });

  test('should login with self healing locators', async () => {
    await loginPage.loginAsStandardUserWithHealing();
  });

  test('should heal a deliberately broken selector and still login', async () => {
    await loginPage.loginWithBrokenSelectorHealing();
  });

});