import { test } from '@playwright/test';
import fs from 'fs';

test.describe('Shopify Broken Links + Images Crawler', () => {

  test('BrokenLinks - Ultra Fast Version', async ({ page, request }) => {

    console.log('✅ TEST STARTED - CRAWLER RUNNING');

    const baseURL = 'https://live.abelini.com/';

    const visited = new Set();
    const queue = [baseURL];
    let index = 0;

    const brokenLinks = new Set();
    const validLinks = new Set();

    const brokenImages = new Set();
    const validImages = new Set();

    const checkedLinks = new Set();
    const checkedImages = new Set();

    test.setTimeout(0);

    // =========================
    // ⚡ BATCH VALIDATOR
    // =========================
    const validateBatch = async (urls, type) => {

      if (!urls.length) return;

      const batchSize = 30;

      for (let i = 0; i < urls.length; i += batchSize) {

        const chunk = urls.slice(i, i + batchSize);

        await Promise.all(chunk.map(async (url) => {

          try {
            const res = await request.get(url, { timeout: 15000 });

            if (res.status() >= 400) {
              type === 'link'
                ? brokenLinks.add(url)
                : brokenImages.add(url);
            } else {
              type === 'link'
                ? validLinks.add(url)
                : validImages.add(url);
            }

          } catch {
            type === 'link'
              ? brokenLinks.add(url)
              : brokenImages.add(url);
          }
        }));
      }
    };

    // =========================
    // 🔁 MAIN CRAWL LOOP
    // =========================
    while (index < queue.length) {

      const url = queue[index++];

      if (!url || visited.has(url)) continue;

      visited.add(url);

      console.log(`Crawling [${visited.size}] => ${url}`);

      try {
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 60000
        });
      } catch {
        brokenLinks.add(url);
        continue;
      }

      // =========================
      // 🔽 LOAD MORE
      // =========================
      for (let i = 0; i < 20; i++) {

        const loadMoreBtn = page.locator('text=Load More');

        if (!(await loadMoreBtn.isVisible().catch(() => false)))
          break;

        try {
          await loadMoreBtn.click();
          await page.waitForTimeout(1000);
        } catch {
          break;
        }
      }

      // =========================
      // 🔗 LINKS
      // =========================
      const links = await page.$$eval('a[href]', els =>
        [...new Set(els.map(e => e.href))]
      );

      const filteredLinks = links.filter(link =>
        link &&
        link.startsWith(baseURL) &&
        !link.includes('#') &&
        !link.startsWith('mailto:') &&
        !link.startsWith('tel:') &&
        !link.includes('/cart') &&
        !link.includes('/checkout') &&
        !link.includes('/account')
      );

      // =========================
      // 🖼️ IMAGES
      // =========================
      const images = await page.$$eval('img[src]', imgs =>
        [...new Set(imgs.map(i => i.src))]
      );

      // =========================
      // 🚀 QUEUE ADD
      // =========================
      for (const link of filteredLinks) {
        if (!visited.has(link)) {
          queue.push(link);
        }
      }

      // =========================
      // ⚡ DEDUP VALIDATION
      // =========================
      const newLinks = filteredLinks.filter(l => {
        if (checkedLinks.has(l)) return false;
        checkedLinks.add(l);
        return true;
      });

      const newImages = images.filter(i => {
        if (checkedImages.has(i)) return false;
        checkedImages.add(i);
        return true;
      });

      await Promise.all([
        validateBatch(newLinks, 'link'),
        validateBatch(newImages, 'image')
      ]);

      console.log(`Visited: ${visited.size} | Queue: ${queue.length}`);
    }

    // =========================
    // 📊 REPORT
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

    const toCSV = (data) =>
      [...data].map(x => `"${x}"`).join('\n');

    fs.writeFileSync('broken-links.csv', toCSV(brokenLinks));
    fs.writeFileSync('broken-images.csv', toCSV(brokenImages));
    fs.writeFileSync('valid-links.csv', toCSV(validLinks));
    fs.writeFileSync('valid-images.csv', toCSV(validImages));

    console.log('\n✅ Reports generated successfully');
  });

});