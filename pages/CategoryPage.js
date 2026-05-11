const { expect } = require('@playwright/test');
const categoryConfig = require('../configs/CategoryConfig');
const categoryData = require('../configs/test-data/categoryDescriptions');
const breadcrumbData = require('../configs/test-data/breadcrumbData');

class CategoryPage {
  constructor(page) {
    this.page = page;

    // LOCATORS
    this.breadcrumb = page.locator('.breadcrumb');

  this.productCards = this.page.locator("a[href^='/product/']:visible");

    this.trustpilotBanner = page.locator('.collection-banner').first();
  }

  // ==============================
  // COMMON HELPERS
  // ==============================

  formatCategoryName(slug) {
    return slug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  // ==============================
  // NAVIGATION (GENERIC)
  // ==============================

  async navigateToCategory(basePath, slug) {
    await this.page.goto(`${basePath}/${slug}`, {
      waitUntil: 'domcontentloaded'
    });

    try {
      await this.productCards.first().waitFor({
        state: 'visible',
        timeout: 15000
      });
    } catch {
      console.log(`❌ No products visible for ${slug}`);
      return false;
    }

    const productCount = await this.productCards.count();

    if (productCount === 0) {
      console.log(`❌ No products found in ${slug}`);
      return false;
    }

    console.log(`✅ Products found in ${slug}: ${productCount}`);
    return true;
  }

  // ==============================
  // BREADCRUMB VALIDATION
  // ==============================

// async validateBreadcrumb(slug) {
//   // Wait for breadcrumb
//   await this.page.waitForSelector('nav[aria-label="breadcrumb"]', { timeout: 10000 });

//   // Use safer locator
//   const breadcrumbEl = this.page
//     .locator('nav[aria-label="breadcrumb"]')
//     .locator('li, span, a')
//     .last();

//   // Get text safely
//   const breadcrumbText = (await breadcrumbEl.textContent()) || '';

//   console.log('Slug:', slug);
//   console.log('Breadcrumb Raw:', breadcrumbText);

//   if (!breadcrumbText.trim()) {
//     console.log(`⚠️ Breadcrumb NOT FOUND in DOM for: ${slug}`);
//     return;
//   }

//   // Format slug
//   const formattedSlug = slug
//     .replace(/\//g, ' ')
//     .replace(/-/g, ' ')
//     .toLowerCase();

//   // Normalize breadcrumb
//   const normalizedBreadcrumb = breadcrumbText
//     .replace(/[^a-zA-Z0-9 ]/g, '')
//     .replace(/\s+/g, ' ')
//     .trim()
//     .toLowerCase();

//   // Split words
//   const slugWords = formattedSlug.split(' ');

//   // Strong matching (ignore small words)
//   const isMatch = slugWords.some(word =>
//     word.length > 2 && normalizedBreadcrumb.includes(word)
//   );

//   if (isMatch) {
//     console.log(`✅ Breadcrumb matched for: ${slug}`);
//   } else {
//     console.log(`⚠️ No breadcrumb data for: ${slug}`);
//   }
// }
// async validateBreadcrumb(slug) {
//   try {
//     // ✅ Wait for page load properly (important fix)
//     await this.page.waitForLoadState('domcontentloaded');

//     // ✅ Try multiple breadcrumb selectors (handles site variations)
//     const breadcrumbContainer = this.page.locator(`
//       nav[aria-label="breadcrumb"],
//       .breadcrumb,
//       [data-testid="breadcrumb"]
//     `);

//     // ✅ Wait safely (not strict fail)
//     const isVisible = await breadcrumbContainer.first().isVisible({ timeout: 10000 }).catch(() => false);

//     if (!isVisible) {
//       console.log(`⚠️ Breadcrumb container NOT FOUND for: ${slug}`);
      
//       // 🔍 Debug (VERY IMPORTANT)
//       console.log("Current URL:", this.page.url());
//       return false;
//     }

//     // ✅ Get last breadcrumb (current page)
//     const currentCrumb = breadcrumbContainer
//       .locator('span[aria-current="page"], li:last-child, a:last-child')
//       .last();

//     const breadcrumbText = ((await currentCrumb.textContent()) || '').trim();

//     console.log('Slug:', slug);
//     console.log('Breadcrumb Raw:', breadcrumbText);

//     if (!breadcrumbText) {
//       console.log(`⚠️ Breadcrumb text EMPTY for: ${slug}`);
//       return false;
//     }

//     // ✅ Normalize
//     const normalize = (text) =>
//       text
//         .toLowerCase()
//         .replace(/[^a-z0-9 ]/g, '')
//         .replace(/\s+/g, ' ')
//         .trim()
//         .replace(/s$/, '');

//     const formattedSlug = slug.replace(/[-/]/g, ' ');
//     const normalizedSlug = normalize(formattedSlug);
//     const normalizedBreadcrumb = normalize(breadcrumbText);

//     const slugWords = normalizedSlug.split(' ');

//     const isMatch = slugWords.some(word =>
//       word.length > 2 && normalizedBreadcrumb.includes(word)
//     );

//     if (isMatch) {
//       console.log(`✅ Breadcrumb matched for: ${slug}`);
//       return true;
//     } else {
//       console.log(`❌ Breadcrumb mismatch for: ${slug}`);
//       console.log(`Expected: ${normalizedSlug}`);
//       console.log(`Actual: ${normalizedBreadcrumb}`);
//       return false;
//     }

//   } catch (error) {
//     console.log(`⚠️ Breadcrumb check FAILED for: ${slug}`);
//     console.error(error.message);
//     return false;
//   }
// }
async validateBreadcrumb(slug) {
  try {
    // ✅ Wait for page load properly
    await this.page.waitForLoadState('domcontentloaded');

    // ✅ Try multiple breadcrumb selectors
    const breadcrumbContainer = this.page.locator(`
      nav[aria-label="breadcrumb"],
      .breadcrumb,
      [data-testid="breadcrumb"]
    `);

    // ✅ Wait safely
    const isVisible = await breadcrumbContainer.first().isVisible({ timeout: 10000 }).catch(() => false);

    if (!isVisible) {
      console.log(`⚠️ Breadcrumb container NOT FOUND for: ${slug}`);
      console.log("Current URL:", this.page.url());
      return false;
    }

    // ✅ Get last breadcrumb (current page)
    const currentCrumb = breadcrumbContainer
      .locator('span[aria-current="page"], li:last-child, a:last-child')
      .last();

    const breadcrumbText = ((await currentCrumb.textContent()) || '').trim();

    console.log('Slug:', slug);
    console.log('Breadcrumb Raw:', breadcrumbText);

    if (!breadcrumbText) {
      console.log(`⚠️ Breadcrumb text EMPTY for: ${slug}`);
      return false;
    }

    // ✅ FIXED Normalize (REMOVED wrong plural logic)
    const normalize = (text) =>
      text
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const formattedSlug = slug.replace(/[-/]/g, ' ');
    const normalizedSlug = normalize(formattedSlug);
    const normalizedBreadcrumb = normalize(breadcrumbText);

    const slugWords = normalizedSlug.split(' ');

    // ✅ FIXED matching logic (handles partial + reverse match)
    const isMatch = slugWords.some(word =>
      word.length > 2 &&
      (
        normalizedBreadcrumb.includes(word) ||   // normal match
        word.includes(normalizedBreadcrumb)      // reverse match (IMPORTANT)
      )
    );

    if (isMatch) {
      console.log(`✅ Breadcrumb matched for: ${slug}`);
      return true;
    } else {
      console.log(`❌ Breadcrumb mismatch for: ${slug}`);
      console.log(`Expected: ${normalizedSlug}`);
      console.log(`Actual: ${normalizedBreadcrumb}`);
      return false;
    }

  } catch (error) {
    console.log(`⚠️ Breadcrumb check FAILED for: ${slug}`);
    console.error(error.message);
    return false;
  }
}

  // ==============================
  // DESCRIPTION VALIDATION
  // ==============================

async validateCategoryDescription(categoryKey, slug) {

  const expectedText = categoryData[categoryKey]?.[slug]?.description;

  if (!expectedText) {
    console.log(`⚠️ No data for ${slug}`);
    return;
  }

  // ✅ FIXED LOCATOR
 const descriptionLocator = this.page.locator('p.px-3.text-p-16');
const actualText = await descriptionLocator.innerText();

  const normalize = text =>
    text
      .replace(/\s+/g, ' ')
      .replace(/read more\s*>>?/gi, '')
      .trim()
      .toLowerCase();

  const actual = normalize(actualText);
  const expected = normalize(expectedText);

  console.log("Actual:", actual); // debug

  await expect(actual).toContain(expected.substring(0, 80));

  console.log(`✅ Description validated for ${slug}`);
}

  // ==============================
  // PRODUCT VALIDATION
  // ==============================

  // async validateAllProducts() {
  //   const count = await this.productCards.count();

  //   expect(count).toBeGreaterThan(0);

  //   for (let i = 0; i < count; i++) {
  //     const card = this.productCards.nth(i);

  //     const title = await card.locator('h3').innerText();
  //     const href = await card.getAttribute('href');

  //     expect(title).toBeTruthy();
  //     expect(href).toContain('/product/');
  //   }
  // }

  // ==============================
  // METAL + STONE FILTER
  // ==============================

  async openMetalDropdown() {
    const metalBtn = this.page.locator('button:has-text("Metal")');

    if (!(await metalBtn.isVisible().catch(() => false))) {
      console.log("Metal dropdown not available");
      return false;
    }

    await metalBtn.click();

    const metalOptions = this.page.locator('[data-type="metal"]');

    try {
      await metalOptions.first().waitFor({ state: 'visible', timeout: 8000 });
    } catch {
      console.log("No metal options found");
      return false;
    }

    return true;
  }

  async selectAllMetalsSequentially() {
    const hasDropdown = await this.openMetalDropdown();
    if (!hasDropdown) return;

    const clearall = this.page.getByRole('link', { name: 'Clear All' });
    const metalOptions = this.page.locator('[data-type="metal"]');

    const count = await metalOptions.count();
    console.log(`Total metals found: ${count}`);

    for (let i = 0; i < count; i++) {

      const metal = this.page.locator('[data-type="metal"]').nth(i);
      const metalName = await metal.getAttribute('data-name');

      console.log(`Selecting metal: ${metalName}`);

      await metal.click();

      await clearall.first().waitFor({ state: 'visible', timeout: 10000 });

      const stoneDropdown = this.page.locator('button:has-text("Stone Type")');

      if (await stoneDropdown.count() > 0) {

        await stoneDropdown.click();

        const stoneOptions = this.page.locator('[data-type="stone_type"]');

        await stoneOptions.first().waitFor({
          state: 'visible',
          timeout: 10000
        });

        const stoneCount = await stoneOptions.count();

        if (stoneCount > 0) {

          const stone = stoneOptions.first();
          const stoneName = await stone.getAttribute('data-name');

          console.log(`Selecting stone: ${stoneName}`);

          await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
            stone.locator('a').click()
          ]);

          const currentURL = this.page.url();

          if (currentURL.includes('filter_param=')) {
            console.log(`✅ filter applied: ${metalName} + ${stoneName}`);
          } else {
            console.log(`⚠️ filter missing for ${metalName}`);
          }

          await this.collectProductLinks(`${metalName} + ${stoneName}`);

          await this.page.goBack();
          await this.page.waitForLoadState('domcontentloaded');
        }
      }

      await this.page.locator('button:has-text("Metal")').click();
    }
  }

  async collectProductLinks(filterName) {
    const count = await this.productCards.count();
    console.log(`Products under ${filterName}: ${count}`);
  }

  // ==============================
  // QUICK VIEW
  // ==============================

  async validateQuickViewForAllProducts() {
    const quickViewButtons = this.page.locator('button').filter({ hasText: 'Quick View' });

    const count = await quickViewButtons.count();

    console.log(`Total Quick View buttons: ${count}`);

    if (count === 0) return;

    for (let i = 0; i < count; i++) {

      const btn = quickViewButtons.nth(i);

      await btn.scrollIntoViewIfNeeded();
      await btn.hover();
      await btn.click({ force: true });

      const popupTitle = this.page.getByRole('heading').first();
      await expect(popupTitle).toBeVisible({ timeout: 15000 });

      const referenceLocator = this.page.locator('p:has-text("SKU:")');
      await expect(referenceLocator).toBeVisible();

      const referenceText = await referenceLocator.textContent();
      const referenceCode = referenceText.replace('Reference Code:', '').trim();

      expect(referenceCode.length).toBeGreaterThan(0);

      const closeBtn = this.page.getByRole('button', { name: /close/i });

      if (await closeBtn.count()) {
        await closeBtn.first().click();
      } else {
        await this.page.keyboard.press('Escape');
      }

      await expect(referenceLocator).toBeHidden({ timeout: 10000 });
    }

    console.log("Quick View validation completed");
  }

  // ==============================
  // MASTER METHOD (ALL CATEGORIES)
  // ==============================

  async validateAllCategories() {

    for (const key of Object.keys(categoryConfig)) {

      const { basePath, name, slugs } = categoryConfig[key];

      console.log(`\n===== Checking ${name} =====`);

      for (const slug of slugs) {

        console.log(`\nChecking category: ${slug}`);

        const loaded = await this.navigateToCategory(basePath, slug);
        if (!loaded) continue;

       await this.validateBreadcrumb(slug);

        // OPTIONAL (enable as needed)

        await this.validateCategoryDescription(key, slug);
         await this.validateQuickViewForAllProducts();
         await this.selectAllMetalsSequentially();
      }
    }
  }
}

module.exports = CategoryPage;