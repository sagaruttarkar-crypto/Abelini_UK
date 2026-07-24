import { test, expect } from '@playwright/test';

const baseURL = 'https://www.abelini.com';

const categories = [
  '/engagement-rings',
  '/engagement-rings/classic-solitaire',
  '/engagement-rings/halo-rings',
  '/engagement-rings/side-stone-shoulder-set-rings',
  '/engagement-rings/illusion-set-rings',
  '/engagement-rings/toi-et-moi',
  '/engagement-rings/couples',
  '/engagement-rings/trilogy-rings',
  '/engagement-rings/twisted-engagement-ring',
  '/engagement-rings/gemstone-engagement-ring',
  '/engagement-rings/diamond-band',
  '/engagement-rings/unique-engagement-rings',
  '/engagement-rings?filter_param=5.170',
  '/engagement-rings/antique-engagement-rings',
  '/engagement-rings/vintage-engagement-rings',
  '/engagement-rings/minimalist-engagement-rings',
  '/engagement-rings/mens',
  '/engagement-rings/womens',
  '/engagement-rings/black-diamond',
  '/engagement-rings/ruby',
  '/engagement-rings/tanzanite',
  '/engagement-rings/emeralds',
  '/engagement-rings/blue-sapphire',
  '/engagement-rings/aquamarine',
  '/engagement-rings/moissanite',
  '/engagement-rings/oval',
  '/engagement-rings/amethyst',
  '/wedding-rings',
  '/wedding-rings/couples',
  '/wedding-rings?filter_param=5.474',
  '/wedding-rings/unique-mens-wedding-bands',
  '/wedding-rings?filter_param=5.67',
  '/wedding-rings/plain',
  '/wedding-rings/vintage-wedding-rings',
  '/wedding-rings?filter_param=5.68',
  '/wedding-rings/unusual-wedding-rings',
  '/wedding-rings?filter_param=5.104',
  '/wedding-rings?filter_param=5.69',
  '/wedding-rings/bands',
  '/wedding-rings/diamond-band',
  '/wedding-rings/mens',
  '/wedding-rings/womens',
  '/wedding-rings/rose-gold',
  '/wedding-rings/white-gold',
  '/wedding-rings/yellow-gold',
  '/wedding-rings/emerald',
  '/wedding-rings/marquise',
  '/wedding-rings/oval',
  '/wedding-rings/pear',
  '/wedding-rings/platinum',
  '/wedding-rings/princess',
  '/wedding-rings/mens',
  '/diamond-rings',
  '/diamond-rings/cluster-rings',
  '/diamond-rings/halo-rings',
  '/diamond-rings/two-stone-rings',
  '/diamond-rings?filter_param=5.473',
  '/diamond-rings/couples',
  '/diamond-rings/five-stone-rings',
  '/diamond-rings/seven-stone-rings',
  '/diamond-rings/bands',
  '/diamond-rings/half-eternity-rings',
  '/diamond-rings/promise-rings',
  '/diamond-rings/full-eternity-rings',
  '/diamond-rings/eternity-rings',
  '/diamond-rings/trilogy-rings',
  '/diamond-rings?filter_param=5.533',
  '/diamond-rings/stacking-ring',
  '/diamond-rings/flower-diamond',
  '/diamond-rings?filter_param=5.162',
  '/diamond-rings/gemstone-rings',
  '/diamond-rings/baguette',
  '/earrings',
  '/earrings/stud-earrings',
  '/earrings/halo-earrings',
  '/earrings/drop-earrings',
  '/earrings/hoop-earrings',
  '/earrings/designer-earrings',
  '/earrings?filter_param=5.153',
  '/earrings/yellow-gold',
  '/earrings/lab-grown-diamond',
  '/earrings/black-diamond',
  '/earrings/white-gold',
  '/earrings/rose-gold',
  '/earrings/silver',
  '/pendants/cross-pendants',
  '/pendants/heart-pendants',
  '/pendants/circle-pendants',
  '/pendants/halo-pendants',
  '/pendants/gemstone-necklaces',
  '/pendants/designer-pendants',
  '/pendants?filter_param=5.90',
  '/pendants/initial-diamond-pendant',
  '/pendants?filter_param=5.94',
  '/pendants/drop-pendants',
  '/pendants/personalise-pendants',
  '/pendants?filter_param=5.501',
  '/pendants/number-pendants',
  '/pendants/yellow-gold',
  '/pendants/platinum',
  '/pendants/lab-grown-diamond',
  '/pendants/silver',
  '/pendants/blue-sapphire',
  '/pendants/ruby',
  '/pendants/emeralds',
  '/bracelets',
  '/bracelets/friendship-bracelet',
  '/bracelets/tennis-bracelets',
  '/bracelets/delicate-bracelet',
  '/bracelets/charms',
  '/bracelets/bangles',
  '/bracelets/silver',
  '/bracelets/rose-gold',
  '/bracelets/white-gold',
  '/bracelets/yellow-gold',
  '/bracelets/platinum',
  '/ready-to-deliver'
];

const PRODUCTS_PER_CATEGORY = 96;

test('Check first 96 products per category for 200/404 status', async ({ page }) => {

  test.setTimeout(3 * 60 * 60 * 1000); // 3 hours (safe buffer for 1.5hr+ runs)

  const finalReport = []; // { category, url, status, ok }

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
        waitUntil: 'domcontentloaded', // content check karne ke liye load hona zaroori hai
        timeout: 20000
      });

      const httpStatus = response ? response.status() : null;

      if (!response) {
        return { code: '404', isBroken: true };
      }

      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      // 🔍 "Page Not Found" wala soft-404 content check
      let isSoftNotFound = await page
        .getByText(/Page Not Found|Broken Or Doesn't Exist/i)
        .first()
        .isVisible()
        .catch(() => false);

      if (isSoftNotFound) {
        await page.waitForTimeout(2000);
        isSoftNotFound = await page
          .getByText(/Page Not Found|Broken Or Doesn't Exist/i)
          .first()
          .isVisible()
          .catch(() => false);
      }

      if (isSoftNotFound || httpStatus === 404) {
        return { code: '404', isBroken: true };
      }

      if (httpStatus !== 200) {
        return { code: httpStatus, isBroken: true };
      }

      return { code: 200, isBroken: false };
    } catch (err) {
      return { code: `ERROR: ${err.message.split('\n')[0]}`, isBroken: true };
    }
  }

  for (const categoryPath of categories) {
    console.log(`\n===== Processing category: ${categoryPath} =====`);

    const productLinks = await loadCategoryProducts(categoryPath);

    for (let i = 0; i < productLinks.length; i++) {
      const url = productLinks[i];
      const result = await checkStatusByClick(url);

      finalReport.push({
        category: categoryPath,
        url,
        status: result.code,
        ok: !result.isBroken
      });

      if (result.isBroken) {
        console.log(`404 - ${url}`);
      }

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
    console.log(`\n----- BROKEN (404) LINKS -----`);
    brokenLinks.forEach((r) => {
      console.log(`404 - ${r.url}`);
    });
  }

  expect(brokenLinks.length, `${brokenLinks.length} broken product links found`).toBe(0);
});