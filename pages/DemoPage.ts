import { Page, Locator, expect } from '@playwright/test';

export class DemoPage {

  readonly page: Page;
  readonly logo: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly firstProduct: Locator;
  readonly addToCartButton: Locator;
  readonly myAccountLink: Locator;
  readonly loginLink: Locator;
  readonly footerText: Locator;
  readonly cartIcon: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.locator('img[title="Your Store"]');
    this.searchInput = page.locator('input[name="search"]');
    this.searchButton = page.locator('button[class*="btn-default"][type="button"]').first();
    this.firstProduct = page.locator('div[class="product-thumb"] >> nth=0');
    this.addToCartButton = page.locator('button[id*="button-cart"]').first();
    this.myAccountLink = page.locator('a:has-text("My Account")');
    this.loginLink = page.locator('a:has-text("Login")');
    this.footerText = page.locator('footer');
    this.cartIcon = page.locator('a[href*="checkout/cart"]');
  }

  async goto() {
    await this.page.goto('https://demo.opencart.com');
  }

  async verifyHomePageLoaded() {
    await expect(this.logo).toBeVisible();
  }

  async searchForProduct() {
    await this.searchInput.fill('iPhone');
    await this.searchButton.click();
    await expect(this.page.locator('text=iPhone')).toBeVisible();
  }

  async addProductToCart() {
    await this.firstProduct.hover();
    await this.addToCartButton.click();
    await expect(this.page.locator('text=Success')).toBeVisible();
  }

  async navigateToLoginPage() {
    await this.myAccountLink.click();
    await this.loginLink.click();
    await expect(this.page.locator('text=Login')).toBeVisible();
  }

  async verifyFooterContent() {
    await expect(this.footerText).toBeVisible();
  }

}