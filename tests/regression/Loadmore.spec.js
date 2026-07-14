import { test, expect } from '@playwright/test';

test('Load More - duplicate & loop detection', async ({ page }) => {

  await page.goto('https://live.abelini.com');

  // OPTIONAL: navigate to a category page if needed
  // await page.goto('https://live.abelini.com/wedding-rings');

  const seenProducts = new Set();
  let previousCount = 0;
  let loadMoreClicked = 0;
  let duplicateFound = false;

  while (true) {

    // Get all product links/cards (adjust selector if needed)
    const products = await page.locator('a[href*="/product/"]').all();

    for (const product of products) {
      const href = await product.getAttribute('href');

      if (!href) continue;

      // DUPLICATE DETECTION
      if (seenProducts.has(href)) {
        console.log(`❌ Duplicate found: ${href}`);
        duplicateFound = true;
      } else {
        seenProducts.add(href);
      }
    }

    const currentCount = seenProducts.size;

    console.log(`Loaded products: ${currentCount}`);

    // STOP CONDITION: no new products loaded
    if (currentCount === previousCount) {
      console.log('✅ No new products loaded. End of list reached.');
      break;
    }

    previousCount = currentCount;

    // Locate Load More button
    const loadMoreBtn = page.locator('button:has-text("LOAD MORE")');

    if (await loadMoreBtn.count() === 0) {
      console.log('ℹ️ Load More button not found. End of pagination.');
      break;
    }

    if (!(await loadMoreBtn.first().isVisible())) {
      console.log('ℹ️ Load More not visible anymore.');
      break;
    }

    // Scroll + click safely
    await loadMoreBtn.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    await loadMoreBtn.first().click();
    loadMoreClicked++;

    console.log(`🔄 Load More clicked: ${loadMoreClicked} times`);

    // Wait for network / DOM update
    await page.waitForLoadState('networkidle');
  }

  // FINAL ASSERTIONS

  expect(duplicateFound).toBeFalsy();

  console.log('========================');
  console.log(`Total unique products: ${seenProducts.size}`);
  console.log(`Load More clicks: ${loadMoreClicked}`);
  console.log('========================');

});