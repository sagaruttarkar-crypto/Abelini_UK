const { test } = require('@playwright/test');

const BASE_URL = 'https://www.abelini.com';
const START_URL = `${BASE_URL}/sitemap`;
const SEARCH_WORD = 'RRP';

test('Full site crawler (optimized)', async ({ page }) => {
  test.setTimeout(10 * 60 * 1000); // 10 minutes

  // Open login page
  await page.goto(START_URL, {
    waitUntil: 'domcontentloaded'
  });

  // Login
  await page.getByPlaceholder('Username').fill('admin');
  await page.getByPlaceholder('Password').fill('admin');
  await page.getByRole('button', { name: 'Enter' }).click();

  // Wait until login completes
  await page.waitForLoadState('networkidle');

  const visited = new Set();
  const queue = [START_URL];
  const matchedPages = [];
  const MAX_PAGES = 200;

  function normalize(url) {
    try {
      return new URL(url).href.split('#')[0];
    } catch {
      return null;
    }
  }

  while (queue.length > 0 && visited.size < MAX_PAGES) {
    const currentUrl = normalize(queue.shift());

    if (!currentUrl || visited.has(currentUrl)) {
      continue;
    }

    visited.add(currentUrl);

    try {
      console.log(`Scanning (${visited.size}/${MAX_PAGES}): ${currentUrl}`);

      await page.goto(currentUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 45000
      });

      const bodyText = await page.locator('body').innerText();

      if (bodyText.toLowerCase().includes(SEARCH_WORD.toLowerCase())) {
        matchedPages.push(currentUrl);
        console.log(`✅ FOUND "${SEARCH_WORD}" : ${currentUrl}`);
      }

      const links = await page.locator('a').evaluateAll(elements =>
        elements
          .map(el => el.href)
          .filter(Boolean)
      );

      for (const link of links) {
        const normalized = normalize(link);

        if (
          normalized &&
          normalized.startsWith(BASE_URL) &&
          !visited.has(normalized)
        ) {
          queue.push(normalized);
        }
      }

    } catch (error) {
      console.log(`❌ Failed: ${currentUrl}`);
      console.log(error.message);
    }
  }

  console.log('\n===========================');
  console.log(`Keyword: ${SEARCH_WORD}`);
  console.log(`Visited Pages: ${visited.size}`);
  console.log(`Matched Pages: ${matchedPages.length}`);
  console.log('===========================\n');

  matchedPages.forEach(url => console.log(url));
});