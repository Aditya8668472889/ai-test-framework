import { test } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { InventoryPage } from "../pages/InventoryPage";

test.describe("Inventory Page", () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    inventoryPage = await loginPage.loginAsStandardUser();
  });

  test("should display all products", async () => {
    await inventoryPage.verifyProductsAreDisplayed();
  });

  test("should sort products by price low to high", async () => {
    await inventoryPage.verifySortByPriceLowToHigh();
  });

  test("should add first product to cart", async () => {
    await inventoryPage.verifyAddFirstProductToCart();
  });

  test("should sort products by name Z to A", async () => {
    await inventoryPage.verifySortByNameZtoA();
  });
});
