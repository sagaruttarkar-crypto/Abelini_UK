const { test } = require('@playwright/test');
const ProductPage = require('../../pages/ProductPage');

const Braclates = require('../../configs/test-data/Braclates');
const DiamondRings = require('../../configs/test-data/DiamondRings');
const EngagementRing = require('../../configs/test-data/EngagementRing');

test.setTimeout(10 * 60 * 9000); // 10 minutes

// ==========================================
// ENGAGEMENT RINGS
// ==========================================
test.describe('PDP Image Validation - Product URLs', () => {

  // 🔥 Run in parallel
  test.describe.configure({ mode: 'parallel' });

  for (const url of EngagementRing) {

    test.only(`Min , Max , Defualt Price  → ${url}`, async ({ page }) => {

      const productPage = new ProductPage(page);

      await page.goto(url, {
        waitUntil: 'domcontentloaded'
      });

       //await productPage.ProductImagePdp();

      await productPage.validatePriceFilters_EngagementRings();

    });

  }

});

// ==========================================
// BRACELETS
// ==========================================
test.describe('PDP Image Validation - Bracelets', () => {

  // 🔥 Run in parallel
  test.describe.configure({ mode: 'parallel' });

  for (const url of Braclates) {

    test(`Min , Max , Defualt Price  → ${url}`, async ({ page }) => {

      const productPage = new ProductPage(page);

      await page.goto(url, {
        waitUntil: 'domcontentloaded'
      });


      await productPage.validatePriceFilters_Bracelets();

    });

  }

  test.describe('PDP Image Validation - Dimaond Rings ', () => {

  // 🔥 Run in parallel
  test.describe.configure({ mode: 'parallel' });

  for (const url of DiamondRings) {

    test(`Min , Max , Defualt Price  → ${url}`, async ({ page }) => {

      const productPage = new ProductPage(page);

      await page.goto(url, {
        waitUntil: 'domcontentloaded'
      });


      await productPage.validatePriceFilters_DiamondRings();

    });

  }
});

});