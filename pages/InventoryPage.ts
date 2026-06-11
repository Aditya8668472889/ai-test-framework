import { Page, Locator, expect } from "@playwright/test";

export class InventoryPage {
  readonly page: Page;
  readonly productList: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;
  readonly sortDropdown: Locator;
  readonly cartIcon: Locator;
  readonly addToCartButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productList = page.locator(".inventory_list");
    this.productNames = page.locator(".inventory_item_name");
    this.productPrices = page.locator(".inventory_item_price");
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.cartIcon = page.locator(".shopping_cart_link");
    this.addToCartButtons = page.locator(".inventory_item button");
  }

  async verifyPageIsLoaded() {
    await expect(this.page).toHaveURL(/inventory/);
    await expect(this.productList).toBeVisible();
  }

  async verifyProductsAreDisplayed() {
    await expect(this.productNames).toHaveCount(6);
  }

  async verifySortByPriceLowToHigh() {
    await this.sortDropdown.selectOption("lohi");
    const prices = await this.productPrices.allInnerTexts();
    const numbers = prices.map((p) => parseFloat(p.replace("$", "")));
    for (let i = 0; i < numbers.length - 1; i++) {
      expect(numbers[i]).toBeLessThanOrEqual(numbers[i + 1]);
    }
  }

  async verifySortByNameZtoA() {
    await this.sortDropdown.selectOption("za");
    const names = await this.productNames.allInnerTexts();
    for (let i = 0; i < names.length - 1; i++) {
      expect(names[i] >= names[i + 1]).toBeTruthy();
    }
  }

  async verifyAddFirstProductToCart() {
    await this.addToCartButtons.first().click();
    await expect(this.cartIcon).toContainText("1");
  }
}
