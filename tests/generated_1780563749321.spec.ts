import { test, expect, Page } from '@playwright/test';
import { TheinternetPage } from '../pages/TheinternetPage';

test.describe('The Internet - Main Tests', () => {
  let page: Page;
  let internetPage: TheinternetPage;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    internetPage = new TheinternetPage(page);
    await internetPage.goto();
  });

  test('should verify home page loads successfully', async () => {
    await internetPage.verifyHomePageLoads();
  });

  test('should navigate to and verify form authentication page', async () => {
    await internetPage.navigateToFormAuthPage();
  });

  test('should verify checkbox elements are present', async () => {
    await internetPage.verifyCheckboxesPage();
  });

  test('should verify dropdown selection works', async () => {
    await internetPage.verifyDropdownPage();
  });

  test('should verify dynamic loading page is accessible', async () => {
    await internetPage.verifyDynamicLoadingPage();
  });
});