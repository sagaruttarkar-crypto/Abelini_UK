import { test, expect } from '@playwright/test';

test('Capture ALL product links + find broken PDP images', async ({ page }) => {

    const baseURL = 'https://www.abelini.com';
    test.setTimeout(3 * 60 * 60 * 1000);

    await page.goto(`${baseURL}/engagement-rings`, {
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

    // ✅ EXTRACT PRODUCT LINKS FROM LISTING CARDS
    const products = await page.$$eval(
        'div[data-product-id]',
        cards => {
            return cards.map(card => {
                const linkEl = card.querySelector('a[href*="/product"]');
                const titleEl = card.querySelector('h2');

                return {
                    title: titleEl ? titleEl.textContent.trim() : '',
                    url: linkEl ? linkEl.href : ''
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

    // 🔍 CHECK EACH PRODUCT PAGE FOR BROKEN IMAGES
    const brokenImageProducts = [];

    for (let i = 0; i < uniqueProducts.length; i++) {
        const product = uniqueProducts[i];

        if (!product.url) {
            continue;
        }

        // Track any image responses that come back with an error status
        const failedImageUrls = new Set();
        const onResponse = (response) => {
            const req = response.request();
            if (req.resourceType() === 'image' && response.status() >= 400) {
                failedImageUrls.add(req.url());
            }
        };
        page.on('response', onResponse);

        try {
            await page.goto(product.url, {
                waitUntil: 'domcontentloaded'
            });

            await page.waitForTimeout(3000);

            // Check every <img> on the PDP for broken/zero-size sources
            const brokenFromDom = await page.$$eval('img', (imgs) => {
                return imgs
                    .filter((img) => {
                        if (!img.src) return false;
                        const loadedButEmpty =
                            img.complete && img.naturalWidth === 0 && img.naturalHeight === 0;
                        return loadedButEmpty;
                    })
                    .map((img) => ({
                        src: img.src,
                        reason: 'zero-dimension / failed to render'
                    }));
            });

            const brokenFromNetwork = Array.from(failedImageUrls).map(src => ({
                src,
                reason: 'HTTP error response'
            }));

            // Merge & dedupe by src
            const allBroken = [
                ...new Map(
                    [...brokenFromDom, ...brokenFromNetwork].map(b => [b.src, b])
                ).values()
            ];

            if (allBroken.length > 0) {
                brokenImageProducts.push({
                    title: product.title,
                    url: product.url,
                    brokenImages: allBroken
                });

                console.log(`
${brokenImageProducts.length}
🛍️ ${product.title}
🔗 ${product.url}
🖼️ Broken images: ${allBroken.map(b => `${b.src} (${b.reason})`).join(', ')}
        `);
            }

            // console.log(`✅ Checked (${i + 1}/${uniqueProducts.length}): ${product.title}`);

        } catch (err) {
            console.log(`❌ Error checking product: ${product.url}`);
            console.log(err.message);
        } finally {
            page.off('response', onResponse);
        }
    }

    console.log(`🚨 Products with broken images: ${brokenImageProducts.length}`);

});