import { test, expect } from '@playwright/test';

test('Capture ALL product links + prices (FIXED)', async ({ page }) => {

    const baseURL = 'https://www.abelini.com';
    test.setTimeout(3 * 60 * 60 * 1000);

    await page.goto(`${baseURL}/ready-to-deliver`, {
        waitUntil: 'domcontentloaded'
    });

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

            // Create a fresh locator every time before clicking
            const freshLoadMoreBtn = page.getByRole('link', {
                name: /LOAD MORE PRODUCTS/i,
            });

            await expect(freshLoadMoreBtn).toBeVisible({ timeout: 10000 });

            // Playwright automatically scrolls before clicking
            await freshLoadMoreBtn.click();
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

    // 🔍 CHECK EACH PRODUCT PAGE FOR £NaN
    const nanPriceProducts = [];

    for (let i = 0; i < uniqueProducts.length; i++) {
        const product = uniqueProducts[i];

        if (!product.url) {
            continue;
        }

        try {
            await page.goto(product.url, {
                waitUntil: 'domcontentloaded'
            });

            await page.waitForTimeout(3000);

            const productPageText = await page.evaluate(() => {
                return document.body.innerText || '';
            });

            if (/£\s*NaN/i.test(productPageText)) {
                nanPriceProducts.push({
                    title: product.title,
                    url: product.url,
                    priceText: '£NaN'
                });

                console.log(`
${nanPriceProducts.length}
🛍️ ${product.title}
🔗 ${product.url}
💰 Price Text: £NaN
        `);
            }

            // console.log(`✅ Checked (${i + 1}/${uniqueProducts.length}): ${product.title}`);

        } catch (err) {
            console.log(`❌ Error checking product: ${product.url}`);
            console.log(err.message);
        }
    }

    console.log(`🚨 £NaN price products: ${nanPriceProducts.length}`);

});
