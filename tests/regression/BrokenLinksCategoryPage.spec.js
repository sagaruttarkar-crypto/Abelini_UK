import { test, expect } from '@playwright/test';

test('Category Page - Image + SKU + Broken Validation', async ({ page }) => {

  const baseURL = 'https://www.abelini.com';
  test.setTimeout(6000000);

  await page.goto(`${baseURL}/engagement-rings`, {
    waitUntil: 'domcontentloaded'
  });

  // 🔁 Scroll until Load More appears
  async function scrollUntilLoadMore() {
    try {
      for (let i = 0; i < 39; i++) {
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
  for (let i = 0; i < 38; i++) {
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

  // ✅ Extract all images ALONG WITH product name + product URL
  // We walk up from each <img> to the nearest ancestor <a> tag,
  // because on category pages the whole product tile is usually wrapped in a link.
  let images = [];
  try {
    images = await page.$$eval(
      'img[src*="cdn.shopify.com"]',
      imgs => imgs.map(img => {
        const anchor = img.closest('a[href]');
        return {
          src: img.src,
          alt: img.alt || '',
          productUrl: anchor ? anchor.href : 'UNKNOWN_URL',
          // try to get a cleaner product name from title attr / nearby text if alt is empty
          productName: img.alt || anchor?.getAttribute('title') || anchor?.textContent?.trim() || 'UNKNOWN_NAME'
        };
      })
    );
  } catch (err) {
    console.log('❌ Extraction error:', err.message);
  }

  console.log(`🔢 Total images (before filtering): ${images.length}`);

  // 🚫 Drop non-product images (banners, icons, sliders, etc.)
  // Only keep images whose closest <a> actually points to a product page.
  images = images.filter(i => i.productUrl.includes('/product/'));

  console.log(`🔢 Product images (after filtering): ${images.length}`);

  // 🧹 Remove duplicates (based on image src)
  const uniqueImages = [...new Map(images.map(i => [i.src, i])).values()];
  console.log(`🧹 Unique images: ${uniqueImages.length}`);

  // 🔍 Extract SKU directly from the image URL (src)
  // Stops right after the SKU code (digits + optional -suffix like "-lq", "-lbg"),
  // instead of swallowing the rest of the filename (which \w+ was doing since \w includes "_").
  const extractSKU = (url) => {
    if (!url) return 'UNKNOWN';
    const match = url.match(/rin[ew]?\d+(?:-[a-z]+)?/i);
    return match ? match[0] : 'UNKNOWN';
  };

  // ❌ Broken image detection
  // Using page.request (real HTTP call) instead of `new Image()` inside the page,
  // because `new Image().onerror` can misfire for AVIF/format/CORS reasons even when
  // the file actually exists on the CDN. An HTTP status check is more reliable.
  const brokenImages = [];

  for (let i = 0; i < uniqueImages.length; i++) {
    const { src, productUrl, productName } = uniqueImages[i];
    const sku = extractSKU(src);

    try {
      const response = await page.request.get(src);
      const isOk = response.ok(); // true for 200-299

      if (!isOk) {
        brokenImages.push({ sku, productName, productUrl });
      }

    } catch (err) {
      brokenImages.push({ sku, productName, productUrl });
    }
  }

  // 📋 Print clean list format — SKU, Name, URL only
  console.log(`\n❌ Broken Images List (${brokenImages.length}):\n`);
  brokenImages.forEach((item, idx) => {
    console.log(`${idx + 1}. SKU: ${item.sku}`);
    console.log(`   Name: ${item.productName}`);
    console.log(`   URL: ${item.productUrl}`);
    console.log('');
  });

  console.log(`\n📊 Summary: ${brokenImages.length} broken image(s) out of ${uniqueImages.length} unique images.`);

  // Optional: fail the test if any broken images are found
  // expect(brokenImages.length, `Broken images found:\n${JSON.stringify(brokenImages, null, 2)}`).toBe(0);
});