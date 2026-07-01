import { test, expect } from '@playwright/test';

test('Category Page - Image + SKU + Broken Validation', async ({ page }) => {

  const baseURL = 'https://live.abelini.com';
   test.setTimeout(600000);
  await page.goto(`${baseURL}/wedding-rings/womens`, {
    waitUntil: 'domcontentloaded'
  });

  // 🔁 Scroll until Load More appears
  async function scrollUntilLoadMore() {
    try {
      for (let i = 0; i < 41; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
        await page.waitForTimeout(3000);

       const btn = page.getByRole('link', { name: /LOAD MORE PRODUCTS/i });

        if (await btn.isVisible().catch(() => false)) {
          return btn;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  // 🔁 Load More loop
  for (let i = 0; i < 40; i++) {
    try {
      const btn = await scrollUntilLoadMore();

      if (!btn) {
        console.log('🛑 No more Load More button');
        break;
      }

      await btn.click();
      console.log(`➡️ Load More clicked (${i + 1})`);

      await page.waitForTimeout(3000);

    } catch (err) {
      console.log('❌ Load More error:', err.message);
      break;
    }
  }

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

  // ❌ Broken image check
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
      brokenImages.push(src);
    } else {
      //console.log(`✅ OK`);
    }

  } catch (err) {
    console.log(`❌ Error checking image: ${src}`);
    brokenImages.push(src);
  }
}

});