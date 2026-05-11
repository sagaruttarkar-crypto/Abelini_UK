import { test } from '@playwright/test';
import fs from 'fs';

test('Shopify - Broken Links + Images (Advanced Fast Version)', async ({ page, request }) => {

  const baseURL = 'https://www.abelini.com.au/';

  const visited = new Set();
  const toVisit = [baseURL];

  const brokenLinks = new Set();
  const validLinks = new Set();

  const brokenImages = new Set();
  const validImages = new Set();

  test.setTimeout(600000);

  // =========================
  // 🔁 PARALLEL FETCH FUNCTION
  // =========================
  const checkUrlsInParallel = async (urls, type) => {
    await Promise.all(urls.map(async (url) => {
      try {
        const res = await request.get(url, { timeout: 10000 });

        if (res.status() >= 400) {
          type === 'link' ? brokenLinks.add(url) : brokenImages.add(url);
        } else {
          type === 'link' ? validLinks.add(url) : validImages.add(url);
        }
      } catch {
        type === 'link' ? brokenLinks.add(url) : brokenImages.add(url);
      }
    }));
  };

  while (toVisit.length > 0) {

    const url = toVisit.shift();
    if (visited.has(url)) continue;

    visited.add(url);

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    } catch {
      brokenLinks.add(url);
      continue;
    }

    // =========================
    // 🔽 LOAD MORE HANDLING
    // =========================
    while (true) {
      const loadMoreBtn = page.locator('text=Load More');

      if (await loadMoreBtn.isVisible().catch(() => false)) {
        try {
          await loadMoreBtn.click();
          await page.waitForTimeout(2000);
        } catch {
          break;
        }
      } else {
        break;
      }
    }

    // =========================
    // 🔗 EXTRACT LINKS
    // =========================
    const links = await page.$$eval('a', anchors =>
      anchors.map(a => a.href).filter(Boolean)
    );

    const filteredLinks = links.filter(link =>
      link.startsWith(baseURL) &&
      !link.includes('#') &&
      !link.startsWith('mailto:') &&
      !link.startsWith('tel:')
    );

    // Add new pages to crawl
    filteredLinks.forEach(link => {
      if (!visited.has(link)) toVisit.push(link);
    });

    // =========================
    // 🖼️ EXTRACT IMAGES
    // =========================
    const images = await page.$$eval('img', imgs =>
      imgs.map(img => img.src).filter(Boolean)
    );

    // =========================
    // ⚡ PARALLEL VALIDATION
    // =========================
    await checkUrlsInParallel(filteredLinks, 'link');
    await checkUrlsInParallel(images, 'image');

    // =========================
    // 🛑 SAFETY LIMIT (IMPORTANT)
    // =========================
    if (visited.size > 500) {
      console.log('⚠️ Limit reached, stopping crawl...');
      break;
    }
  }

  // =========================
  // 📊 FINAL OUTPUT
  // =========================
  console.log('\n=========== FINAL REPORT ===========');

  console.log(`\n❌ Broken Links (${brokenLinks.size})`);
  [...brokenLinks].forEach(l => console.log(l));

  console.log(`\n❌ Broken Images (${brokenImages.size})`);
  [...brokenImages].forEach(i => console.log(i));

  console.log(`\n✅ Valid Links (${validLinks.size})`);
  [...validLinks].forEach(l => console.log(l));

  console.log(`\n✅ Valid Images (${validImages.size})`);
  [...validImages].forEach(i => console.log(i));

  // =========================
  // 📁 CSV REPORT
  // =========================
  const toCSV = (data) => [...data].map(x => `"${x}"`).join('\n');

  fs.writeFileSync('broken-links.csv', toCSV(brokenLinks));
  fs.writeFileSync('broken-images.csv', toCSV(brokenImages));

});