import { test, expect } from '@playwright/test';

test('Capture ALL product links + prices (FIXED)', async ({ page }) => {

  const baseURL = 'https://www.abelini.com';
 test.setTimeout(30 * 60 * 1000);

  await page.goto(`${baseURL}/engagement-rings`, {
    waitUntil: 'domcontentloaded'
  });

  // 🔁 LOAD MORE LOGIC
  // async function loadAllProducts() {
  //   for (let i = 0; i < 9; i++) {
  //     await page.evaluate(() => window.scrollBy(0, window.innerHeight * 1));
  //     await page.waitForTimeout(2500);

  //     const btn =  page.getByRole('link', {name: 'LOAD MORE PRODUCTS...'});

  //     if (await btn.isVisible().catch(() => false)) {
  //       await btn.click();
  //       console.log(`➡️ Load More clicked (${i + 1})`);
  //       await page.waitForTimeout(3000);
  //     } else {
  //       console.log('🛑 No more Load More');
  //       break;
  //     }
  //   }
  // }
  async function loadAllProducts() {
  const loadMoreBtn = page.getByRole('link', {
    name: /LOAD MORE PRODUCTS/i,
  });

  let clickCount = 0;
  const maxClicks = 50;

  while (clickCount < maxClicks) {

    // Keep scrolling until button appears
    while (!(await loadMoreBtn.isVisible().catch(() => false))) {

      const previousHeight = await page.evaluate(
        () => document.body.scrollHeight
      );

      await page.mouse.wheel(0, 1500);
      await page.waitForTimeout(700);

      const currentHeight = await page.evaluate(
        () => document.body.scrollHeight
      );

      // Reached end and button not found
      if (previousHeight === currentHeight) {
        console.log('✅ No more Load More button.');
        return;
      }
    }

    const beforeCount = await page.locator('div[data-product-id]').count();

    await loadMoreBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    await loadMoreBtn.click();

    clickCount++;
    console.log(`➡️ Load More clicked (${clickCount})`);

    // Wait until more products are loaded
    await page.waitForFunction(
      (count) =>
        document.querySelectorAll('div[data-product-id]').length > count,
      beforeCount,
      { timeout: 15000 }
    );

    await page.waitForTimeout(1500);
  }
}

  await loadAllProducts();

  // 🧠 WAIT for products to fully render
  await page.waitForTimeout(5000);

  // ✅ EXTRACT CORRECTLY FROM PRODUCT CARD
  const products = await page.$$eval(
    'div[data-product-id]',
    cards => {

      
      const cleanPrice = (text) => {
        if (!text) return 0;
        const num = text.replace(/[^0-9.]/g, '');
        return num ? parseFloat(num) : 0;
      };

      return cards.map(card => {

        const linkEl = card.querySelector('a[href*="/product"]');
        const titleEl = card.querySelector('h2');
        const priceEl = card.querySelector('p span:last-child');

        const url = linkEl ? linkEl.href : '';
        const title = titleEl ? titleEl.textContent.trim() : '';
        const priceText = priceEl ? priceEl.textContent.trim() : '';

        return {
          title,
          url,
          priceText,
          price: cleanPrice(priceText)
        };
      });
    }
  );

  console.log(`🔢 Total products: ${products.length}`);

  // 🧹 Remove duplicates
  const uniqueProducts = [
    ...new Map(products.map(p => [p.url, p])).values()
  ];

  console.log(`🧹 Unique products: ${uniqueProducts.length}`);


// ❗ ZERO PRICE FILTER
const zeroPriceProducts = uniqueProducts.filter(p =>
  p.price === 0 || p.priceText.trim() === ''
);

console.log(`🚨 ZERO price products: ${zeroPriceProducts.length}`);

// 🖨️ PRINT ONLY ZERO PRICE PRODUCTS
zeroPriceProducts.forEach((p, i) => {
  console.log(`
${i + 1}
🛍️ ${p.title}
🔗 ${p.url}
💰 Price Text: ${p.priceText}
💵 Parsed Price: ${p.price}
  `);
});
});