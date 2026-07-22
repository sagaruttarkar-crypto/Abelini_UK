import { test, expect } from '@playwright/test';

const baseURL = 'https://www.abelini.com';

const categories = [
  '/engagement-rings',
  '/wedding-rings',
];

const PRODUCTS_PER_CATEGORY = 10;

test('Check first 96 products per category for 200/404 status', async ({ page }) => {

  test.setTimeout(60 * 60 * 1000); 

  const finalReport = [];

  async function loadCategoryProducts(categoryPath) {
    await page.goto(`${baseURL}${categoryPath}`, {
      waitUntil: 'domcontentloaded'
    });

    const loadMoreBtn = page.getByRole('link', {
      name: /LOAD MORE PRODUCTS/i,
    }).first();

    let clickCount = 0;
    const maxClicks = 50;

    while (clickCount < maxClicks) {
      const currentCount = await page.locator('div[data-product-id]').count();
      if (currentCount >= PRODUCTS_PER_CATEGORY) break;

      // Scroll karke button dhundo
      let found = await loadMoreBtn.isVisible().catch(() => false);
      let scrollAttempts = 0;

      while (!found && scrollAttempts < 20) {
        const previousHeight = await page.evaluate(() => document.body.scrollHeight);
        await page.mouse.wheel(0, 1500);
        await page.waitForTimeout(700);
        const currentHeight = await page.evaluate(() => document.body.scrollHeight);
        found = await loadMoreBtn.isVisible().catch(() => false);
        scrollAttempts++;
        if (previousHeight === currentHeight && !found) break; // page end, no more button
      }

      if (!found) {
        console.log(`✅ [${categoryPath}] No more Load More button.`);
        break;
      }

      const beforeCount = await page.locator('div[data-product-id]').count();

      let clicked = false;
      for (let attempt = 0; attempt < 3 && !clicked; attempt++) {
        try {
          await loadMoreBtn.scrollIntoViewIfNeeded({ timeout: 5000 });
          await page.waitForTimeout(500);
          await loadMoreBtn.click({ timeout: 5000 });
          clicked = true;
        } catch (err) {
          console.log(`⚠️ [${categoryPath}] Click attempt ${attempt + 1} failed, retrying...`);
          await page.waitForTimeout(1000);
        }
      }

      if (!clicked) {
        console.log(`🛑 [${categoryPath}] Could not click Load More after retries.`);
        break;
      }

      clickCount++;
      console.log(`➡️ [${categoryPath}] Load More clicked (${clickCount})`);

      try {
        await page.waitForFunction(
          (count) => document.querySelectorAll('div[data-product-id]').length > count,
          beforeCount,
          { timeout: 15000 }
        );
      } catch {
        console.log(`⚠️ [${categoryPath}] No new products loaded after click.`);
        break;
      }

      await page.waitForTimeout(1000);
    }

    const links = await page.$$eval(
      'div[data-product-id] a[href*="/product"]',
      (anchors) => anchors.map(a => a.href)
    );

    const uniqueLinks = [...new Set(links)].slice(0, PRODUCTS_PER_CATEGORY);
    console.log(`🔢 [${categoryPath}] Collected ${uniqueLinks.length} product links`);

    return uniqueLinks;
  }

  async function checkStatusByClick(url) {
    try {
      const response = await page.goto(url, {
        waitUntil: 'commit',
        timeout: 20000
      });

      if (!response) {
        return 'ERROR: No response received';
      }

      return response.status();
    } catch (err) {
      return `ERROR: ${err.message.split('\n')[0]}`;
    }
  }

  // ----------------------------------------------------------
  // 🚀 MAIN LOOP
  // ----------------------------------------------------------
  for (const categoryPath of categories) {
    console.log(`\n===== Processing category: ${categoryPath} =====`);

    const productLinks = await loadCategoryProducts(categoryPath);

    for (let i = 0; i < productLinks.length; i++) {
      const url = productLinks[i];
      const status = await checkStatusByClick(url);
      const ok = status === 200;

      finalReport.push({ category: categoryPath, url, status, ok });

      console.log(`  [${i + 1}/${productLinks.length}] ${status} - ${url}`);

      await page.waitForTimeout(100);
    }
  }

  // ----------------------------------------------------------
  // 📊 SUMMARY
  // ----------------------------------------------------------
  const brokenLinks = finalReport.filter(r => !r.ok);

  console.log(`\n\n================ FINAL SUMMARY ================`);
  console.log(`Total products checked: ${finalReport.length}`);
  console.log(`✅ OK (200): ${finalReport.length - brokenLinks.length}`);
  console.log(`🚨 Broken (404): ${brokenLinks.length}`);

  if (brokenLinks.length > 0) {
    console.log(`\n----- BROKEN / 404    LINKS -----`);
    brokenLinks.forEach((r, i) => {
      console.log(`${i + 1}. [${r.category}] Status: ${r.status} -> ${r.url}`);
    });
  }

  expect(brokenLinks.length, `${brokenLinks.length} broken product links found`).toBe(0);
});