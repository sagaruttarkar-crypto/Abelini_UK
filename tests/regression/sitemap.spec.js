const { test, expect } = require('@playwright/test');
const xml2js = require('xml2js');
const SitemapPage = require('../../pages/SitemapPage');

// Config
const SITEMAP_IMAGE_URL = 'https://www.abelini.com/sitemap-image.xml';
const BASE_SITEMAP_URL = 'https://www.abelini.com/sitemap.xml';

const BATCH_SIZE = 5;
const RETRIES = 2;
const DELAY_MS = 200;


// Helper function to retry requests
async function checkUrl(request, url, brokenUrls, attempt = 1) {
  try {
    const resp = await request.get(url, { failOnStatusCode: false });

    if (!resp.ok()) {
      if (attempt <= RETRIES) {
        console.log(`Retrying ${url} (attempt ${attempt})`);
        await new Promise(res => setTimeout(res, DELAY_MS));
        return checkUrl(request, url, brokenUrls, attempt + 1);
      }

      brokenUrls.push(`${url} -> ${resp.status()}`);
    }

  } catch (err) {

    if (attempt <= RETRIES) {
      console.log(`Retrying ${url} due to error: ${err.message}`);
      await new Promise(res => setTimeout(res, DELAY_MS));
      return checkUrl(request, url, brokenUrls, attempt + 1);
    }

    brokenUrls.push(`${url} -> NETWORK ERROR (${err.message})`);
  }
}


// Helper: validate all links inside page
async function validatePageLinks(page, request, pageUrl, brokenUrls) {

  const links = await page.$$eval('a', anchors =>
    anchors
      .map(a => a.href)
      .filter(href =>
        href &&
        !href.startsWith('mailto') &&
        !href.startsWith('tel') &&
        !href.includes('#')
      )
  );

  const uniqueLinks = [...new Set(links)];

  for (const link of uniqueLinks) {

    try {

      const resp = await request.get(link, { failOnStatusCode: false });
      const status = resp.status();

      if (status >= 400) {
        brokenUrls.push(`${pageUrl} -> ${link} (${status})`);
      }

    } catch (err) {

      brokenUrls.push(`${pageUrl} -> ${link} (NETWORK ERROR)`);

    }

  }

}



test('Validate product pages and images from sitemap-image.xml @regression', async ({ request }) => {

  const brokenUrls = [];

  console.log(`Fetching sitemap: ${SITEMAP_IMAGE_URL}`);

  const response = await request.get(SITEMAP_IMAGE_URL);
  expect(response.ok()).toBeTruthy();

  const xml = await response.text();
  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(xml);

  if (!result.urlset || !result.urlset.url) throw new Error('Invalid sitemap format');

  const urls = result.urlset.url;

  console.log(`Total URLs in sitemap-image.xml: ${urls.length}`);

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {

    const batch = urls.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (entry) => {

        const pageUrl = entry.loc[0];

        await checkUrl(request, pageUrl, brokenUrls);

        // Validate images
        if (entry['image:image']) {

          for (const img of entry['image:image']) {

            const imgUrl = img['image:loc'][0];
            await checkUrl(request, imgUrl, brokenUrls);

          }

        }

      })
    );

    await new Promise(res => setTimeout(res, 500));
  }

  console.log('\n===== BROKEN URL / IMAGE REPORT =====\n');

  if (brokenUrls.length > 0) {
    brokenUrls.forEach(u => console.log(u));
  } else {
    console.log('All URLs and images are valid ✅');
  }

  expect(brokenUrls.length, `Broken URLs/images detected:\n${brokenUrls.join('\n')}`).toBe(0);

});



test('Validate main sitemap, inner URLs and page links @regression', async ({ page, request }) => {

  const brokenUrls = [];

  console.log('\n===== MAIN SITEMAP VALIDATION =====\n');

  const mainResponse = await page.goto(BASE_SITEMAP_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  expect(mainResponse.status()).toBeLessThan(400);

  const body = await page.content();

  const mainSitemaps = [...body.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map(match => match[1]);

  console.log(`Total Main Sitemaps Found: ${mainSitemaps.length}\n`);


  for (const mainUrl of mainSitemaps) {

    await page.waitForTimeout(500);

    console.log(`Main Sitemap: ${mainUrl}`);

    const response = await page.goto(mainUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    const status = response.status();

    console.log(`Status Code: ${status}\n`);

    if (status >= 400) {
      brokenUrls.push(`${mainUrl} -> ${status}`);
      continue;
    }

    const innerBody = await page.content();

    const innerUrls = [...innerBody.matchAll(/<loc>(.*?)<\/loc>/g)]
      .map(match => match[1]);

    console.log(`Total Inner URLs: ${innerUrls.length}\n`);


    for (const innerUrl of innerUrls) {

      await page.waitForTimeout(300);

      const innerResponse = await page.goto(innerUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });

      const innerStatus = innerResponse.status();

      console.log(`   ↳ ${innerUrl} ---> ${innerStatus}`);

      if (innerStatus >= 400) {

        brokenUrls.push(`${innerUrl} -> ${innerStatus}`);

      } else {

        // Validate links inside the page
        await validatePageLinks(page, request, innerUrl, brokenUrls);

      }

    }

    console.log('\n--------------------------------------\n');

  }


  console.log('\n===== FINAL BROKEN URL REPORT =====\n');

  if (brokenUrls.length > 0) {

    brokenUrls.forEach(url => console.log(url));

  } else {

    console.log('No Broken URLs Found ✅');

  }

  expect(
    brokenUrls,
    `Broken URLs detected:\n${brokenUrls.join('\n')}`
  ).toHaveLength(0);

});
test('Validate all category links from sitemap', async ({ page }) => {

  const sitemap = new SitemapPage(page);

  await sitemap.navigateToSitemap();

  const result = await sitemap.validateAllCategoriesFromSitemap();

  console.log('\n========= FINAL RESULT =========');
  console.log(`Categories: ${result.totalCategories}`);
  console.log(`Total Links: ${result.totalLinks}`);
  console.log(`Valid Links: ${result.validLinks}`);
  console.log(`Broken Links: ${result.brokenLinks}`);
});