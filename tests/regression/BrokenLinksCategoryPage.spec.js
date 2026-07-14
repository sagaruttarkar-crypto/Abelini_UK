import { test, expect } from '@playwright/test';

test('Category Page - Image + SKU + Broken Validation', async ({ page }) => {

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

    // ✅ Extract all images
    let images = [];
    try {
        images = await page.$$eval(
            'img[src*="cdn.shopify.com"]',
            imgs => imgs.map(img => ({
                src: img.src,
                alt: img.alt
            }))
        );
    } catch (err) {
        console.log('❌ Extraction error:', err.message);
    }

    console.log(`🔢 Total images: ${images.length}`);

    // 🧹 Remove duplicates
    const uniqueImages = [...new Map(images.map(i => [i.src, i])).values()];
    console.log(`🧹 Unique images: ${uniqueImages.length}`);

    // 🔍 Extract SKU from image URL
    const extractSKU = (url) => {
        const match = url.match(/\/(rin\w+|rine\w+|rinw\w+)/i);
        return match ? match[0].replace('/', '') : 'UNKNOWN';
    };

    // ❌ Broken image detection (browser-based)
    const brokenImages = [];

    for (let i = 0; i < uniqueImages.length; i++) {
        const { src } = uniqueImages[i];

        try {
            const isLoaded = await page.evaluate((url) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.src = url;

                    img.onload = () => resolve(true);
                    img.onerror = () => resolve(false);
                });
            }, src);

            if (!isLoaded) {
                console.log(`❌ Broken Image: ${src}`);
                brokenImages.push({ src, sku: extractSKU(src) });
            }

        } catch (err) {
            console.log(`❌ Error checking image: ${src}`);
            console.log(err.message);
            brokenImages.push({ src, sku: extractSKU(src), error: err.message });
        }
    }

    console.log(`🚨 Total broken images: ${brokenImages.length}`);

});