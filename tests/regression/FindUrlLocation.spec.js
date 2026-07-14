const { test } = require('@playwright/test');
const fs = require('fs');

test('Find URL Locations', async ({ page }) => {
  test.setTimeout(30 * 60 * 1000); // 30 mins

  const START_URL = 'https://www.abelini.com.au/sitemap';
  const DOMAIN = 'https://www.abelini.com.au';

  const expectedLinks = fs
    .readFileSync('Urls.txt', 'utf8')
    .split(/\r?\n/)
    .map(x => x.trim().replace(/\/$/, ''))
    .filter(Boolean);

  const visited = new Set();
  const foundLinks = new Map();
  const results = [];

  const queue = [START_URL];

  while (queue.length > 0) {
    const currentUrl = queue.shift()?.replace(/\/$/, '');

    if (!currentUrl || visited.has(currentUrl)) {
      continue;
    }

    visited.add(currentUrl);

    try {
      console.log(`[${visited.size}] Scanning: ${currentUrl}`);

      await page.goto(currentUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });

      const links = await page.$$eval('a[href]', anchors =>
        anchors.map(a => ({
          href: a.href.replace(/\/$/, ''),
          page: window.location.href.replace(/\/$/, '')
        }))
      );

      for (const link of links) {
        if (!foundLinks.has(link.href)) {
          foundLinks.set(link.href, link.page);
        }

        if (
          link.href.startsWith(DOMAIN) &&
          !visited.has(link.href) &&
          !queue.includes(link.href)
        ) {
          queue.push(link.href);
        }
      }

      console.log(
        `Visited: ${visited.size} | Queue: ${queue.length} | Found Links: ${foundLinks.size}`
      );

    } catch (error) {
      console.log(`❌ Failed: ${currentUrl}`);
      console.log(error.message);
    }
  }

  console.log('\n==============================');
  console.log('SEARCH RESULTS');
  console.log('==============================\n');

  for (const targetUrl of expectedLinks) {
    if (foundLinks.has(targetUrl)) {
      const foundOn = foundLinks.get(targetUrl);

      console.log(`✅ FOUND: ${targetUrl}`);
      console.log(`   Found On: ${foundOn}`);

      results.push({
        url: targetUrl,
        status: 'FOUND',
        foundOn
      });
    } else {
      console.log(`❌ NOT FOUND: ${targetUrl}`);

      results.push({
        url: targetUrl,
        status: 'NOT FOUND',
        foundOn: ''
      });
    }
  }

  fs.writeFileSync(
    'FindUrlResults.json',
    JSON.stringify(results, null, 2)
  );

  console.log('\n================================');
  console.log(`Pages Visited : ${visited.size}`);
  console.log(`Links Found   : ${foundLinks.size}`);
  console.log('Results saved : FindUrlResults.json');
  console.log('================================');
});