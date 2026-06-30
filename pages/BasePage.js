const { expect } = require('@playwright/test');
const env = require('../configs/envSelector');

class BasePage {
  constructor(page, request) {
    this.page = page;
    this.request = request;
    this.baseURL = env.baseURL; // ✅ VERY IMPORTANT
    this.links = page.locator('a');

    console.log('Running ENV:', env.envName);
    console.log('BaseURL:', this.baseURL);
  }

  // ===============================
  // NAVIGATION
  // ===============================

  async navigate(path = '/') {
    const fullUrl = new URL(path, this.baseURL).href; // ✅ safest way
    await this.page.goto(fullUrl, {
      waitUntil: 'domcontentloaded'
    });
  }

  // ➕ Added (safe alternative when networkidle required)
async navigateWithNetworkIdle(path = '/') {
  const fullUrl = new URL(path, this.baseURL).href;

  await this.page.goto(fullUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });

  console.log('👉 Actual URL:', fullUrl);
  console.log('👉 Actual URL:', this.page.url());
}

  // ➕ Added URL validation (used in POMs)
  async verifyURL(expected) {
    await expect(this.page).toHaveURL(expected);
  }

  // ===============================
  // COMMON ACTIONS
  // ===============================

  async click(locator) {
    await locator.click();
  }

  // ➕ Safe click (waits automatically)
  async safeClick(locator) {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  async fill(locator, value) {
    await locator.fill(value);
  }

  // ➕ Safe fill
  async safeFill(locator, value) {
    await locator.waitFor({ state: 'visible' });
    await locator.fill(value);
  }

  async getText(locator) {
    return await locator.textContent();
  }

  async waitFor(locator) {
    await locator.waitFor({ state: 'visible' });
  }

  // ➕ Safe dropdown handler
  async selectDropdown(locator, value) {
    await locator.waitFor({ state: 'visible' });
    await locator.selectOption(value);
  }

  // ➕ Table utility (VERY useful for orders table)
  async getTableCell(rowIndex, colIndex) {
    return await this.page
      .locator('tbody tr')
      .nth(rowIndex)
      .locator('td')
      .nth(colIndex)
      .textContent();
  }

  // ➕ Get entire row as array
  async getTableRow(rowIndex) {
    return await this.page
      .locator('tbody tr')
      .nth(rowIndex)
      .locator('td')
      .allTextContents();
  }

  // ===============================
  // EXISTING BROKEN LINK VALIDATION
  // ===============================

  async validateBrokenLinks() {
    const links = await this.page.locator('a[href]').all();

    const urls = new Set();
    const brokenLinks = [];

    const baseUrl = await this.page.url();
    const base = new URL(baseUrl).origin;

    for (const link of links) {
      const href = await link.getAttribute('href');

      if (!href) continue;

      if (
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        href.startsWith('#')
      ) continue;

      let fullUrl;

      try {
        fullUrl = href.startsWith('http')
          ? href
          : `${base}${href}`;
      } catch {
        continue;
      }

      urls.add(fullUrl);
    }

    for (const url of urls) {
      try {
        if (url.includes('/account') || url.includes('/login')) {
          continue;
        }

        const response = await this.request.get(url, {
          timeout: 15000,
        });

        if (response.status() > 403) {
          brokenLinks.push(`${response.status()} - ${url}`);
        }
      } catch {
        brokenLinks.push(`FAILED - ${url}`);
      }
    }

    if (brokenLinks.length > 0) {
      console.log('\n Broken links found:');
      brokenLinks.forEach(link => console.log(link));
    }

    return brokenLinks;
  }

  // ===============================
  // EXISTING BLOG VALIDATION
  // ===============================

  // async validateAllBlogsLinks() {

  //   const brokenLinks = [];
  //   const loadMoreBtn = this.page.getByText('>|', { exact: true });

  //   if (await loadMoreBtn.count() > 0) {

  //     console.log('Load More button found');

  //     while (await loadMoreBtn.first().isVisible().catch(() => false)) {
  //       await loadMoreBtn.first().scrollIntoViewIfNeeded();
  //       await loadMoreBtn.first().click();
  //       await this.page.waitForLoadState('networkidle');

  //       await this.page.evaluate(() => {
  //         window.scrollTo(0, document.body.scrollHeight);
  //       });
  //     }

  //   } else {

  //     console.log('Load More not found → Switching category');

  //     const categories = this.page.locator('.blog-category a');

  //     if (await categories.count() > 1) {
  //       await categories.nth(1).click();
  //       await this.page.waitForLoadState('domcontentloaded');
  //     }
  //   }

  //   const blogLinks = await this.page.$$eval('a[href*="/blog/"]', links =>
  //     [...new Set(
  //       links
  //         .map(link => link.getAttribute('href'))
  //         .filter(href =>
  //           href &&
  //           !href.includes('/blog?page=') &&
  //           !href.endsWith('/blog') &&
  //           !href.endsWith('/blog/')
  //         )
  //     )]
  //   );

  //   console.log(`Total blogs found: ${blogLinks.length}`);

  //   for (const blog of blogLinks) {

  //     const blogUrl = new URL(blog, this.page.url()).href;

  //     await this.page.goto(blogUrl, {
  //       waitUntil: 'domcontentloaded',
  //       timeout: 60000
  //     });

  //     const links = await this.page.$$eval('a[href]', elements =>
  //       [...new Set(elements.map(el => el.getAttribute('href')))]
  //     );

  //     for (const link of links) {

  //       if (!link ||
  //           link.startsWith('#') ||
  //           link.startsWith('mailto:') ||
  //           link.startsWith('tel:') ||
  //           link.startsWith('javascript:')
  //       ) continue;

  //       const url = new URL(link, this.page.url()).href;

  //       if (!url.includes('myshopify.dev')) continue;

  //       try {
  //         const response = await this.request.get(url, {
  //           headers: { 'User-Agent': 'Mozilla/5.0' }
  //         });

  //         if (response.status() >= 400) {
  //           brokenLinks.push(`${response.status()} - ${url}`);
  //         }

  //       } catch {
  //         brokenLinks.push(`Failed - ${url}`);
  //       }
  //     }
  //   }

  //   console.log('-----------------------------------');
  //   console.log(`Total Broken Blog Links: ${brokenLinks.length}`);
  //   console.log('-----------------------------------');

  //   return brokenLinks;
  // }
//   async validateAllBlogsLinks() {
//   const brokenLinks = [];
//   const allBlogLinks = new Set();

//   // Loop through all pagination pages
//   while (true) {

//     // Collect blog links from current page
//     const blogLinks = await this.page.$$eval('a[href*="/blog/"]', links =>
//       [...new Set(
//         links
//           .map(link => link.getAttribute('href'))
//           .filter(href =>
//             href &&
//             !href.includes('/blog?page=') &&
//             !href.endsWith('/blog') &&
//             !href.endsWith('/blog/')
//           )
//       )]
//     );

//     blogLinks.forEach(link =>
//       allBlogLinks.add(new URL(link, this.page.url()).href)
//     );

//     // Find the Next (>) button
//     const nextBtn = this.page.locator('.pagination a').filter({
//       hasText: '>'
//     }).first();

//     // Stop if no next page
//     if (!(await nextBtn.count()) || !(await nextBtn.isVisible().catch(() => false))) {
//       break;
//     }

//     console.log(`Collected ${allBlogLinks.size} blogs. Moving to next page...`);

//     await Promise.all([
//       this.page.waitForLoadState('domcontentloaded'),
//       nextBtn.click()
//     ]);
//   }

//   console.log(`Total blogs found: ${allBlogLinks.size}`);

//   // Validate every blog page
//   for (const blogUrl of allBlogLinks) {

//     console.log(`Checking ${blogUrl}`);

//     await this.page.goto(blogUrl, {
//       waitUntil: 'domcontentloaded',
//       timeout: 60000
//     });

//     const links = await this.page.$$eval('a[href]', elements =>
//       [...new Set(elements.map(el => el.getAttribute('href')))]
//     );

//     for (const link of links) {

//       if (
//         !link ||
//         link.startsWith('#') ||
//         link.startsWith('mailto:') ||
//         link.startsWith('tel:') ||
//         link.startsWith('javascript:')
//       ) {
//         continue;
//       }

//       const url = new URL(link, this.page.url()).href;

//       // Validate only dev links
//       if (!url.includes('myshopify.dev')) continue;

//       try {
//         const response = await this.request.get(url, {
//           headers: {
//             'User-Agent': 'Mozilla/5.0'
//           }
//         });

//         if (response.status() >= 400) {
//           brokenLinks.push(`${response.status()} - ${url}`);
//         }
//       } catch {
//         brokenLinks.push(`Failed - ${url}`);
//       }
//     }
//   }

//   console.log('-----------------------------------');
//   console.log(`Total Blogs: ${allBlogLinks.size}`);
//   console.log(`Total Broken Links: ${brokenLinks.length}`);
//   console.log('-----------------------------------');

//   return brokenLinks;
// }
async validateAllBlogsLinks() {

  const brokenLinks = [];
  const allBlogLinks = new Set();
  const checkedLinks = new Map();

  // ==========================================
  // STEP 1 - Load all blogs
  // ==========================================

  while (true) {

    // Collect currently visible blogs
    const blogLinks = await this.page.$$eval(
      'a[href*="/blog/"]',
      links =>
        [...new Set(
          links
            .map(link => link.href)
            .filter(href =>
              href &&
              !href.includes('/blog?page=') &&
              !href.endsWith('/blog') &&
              !href.endsWith('/blog/')
            )
        )]
    );

    blogLinks.forEach(link => allBlogLinks.add(link));

    console.log(`Collected Blogs : ${allBlogLinks.size}`);

    const loadMore = this.page.getByRole('button', {
      name: /load more/i
    });

    if (!(await loadMore.isVisible().catch(() => false))) {
      console.log("All blogs loaded.");
      break;
    }

    const previousCount = allBlogLinks.size;

    await loadMore.scrollIntoViewIfNeeded();

    await loadMore.click();

    await this.page.waitForFunction(
      previous => {
        const blogs = new Set(
          [...document.querySelectorAll('a[href*="/blog/"]')]
            .map(a => a.href)
            .filter(href =>
              href &&
              !href.includes('/blog?page=') &&
              !href.endsWith('/blog') &&
              !href.endsWith('/blog/')
            )
        );

        return blogs.size > previous;
      },
      previousCount,
      { timeout: 30000 }
    );
  }

  console.log(`\nTotal Blogs Found : ${allBlogLinks.size}`);

  // ==========================================
  // STEP 2 - Validate blog links
  // ==========================================

  for (const blogUrl of allBlogLinks) {

    console.log(`\nChecking Blog : ${blogUrl}`);

    await this.page.goto(blogUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    await this.page.waitForLoadState("networkidle");

    // Only links inside blog article
    const links = await this.page
      .locator(".max-w-6xl.mx-auto.lg\\:px-5 a[href]")
      .evaluateAll(elements =>
        [...new Set(elements.map(el => el.href))]
      );

    console.log(`Found ${links.length} article links`);

    for (const url of links) {

      if (
        !url ||
        url.startsWith("mailto:") ||
        url.startsWith("tel:") ||
        url.startsWith("javascript:") ||
        url.includes("#")
      ) {
        continue;
      }

      // Only internal links
      if (!url.startsWith(new URL(blogUrl).origin)) {
        continue;
      }

      // Skip already checked links
      if (checkedLinks.has(url)) {

        if (checkedLinks.get(url) >= 400) {
          brokenLinks.push({
            Blog: blogUrl,
            Link: url,
            Status: checkedLinks.get(url)
          });
        }

        continue;
      }

      try {

        let response = await this.request.head(url, {
          failOnStatusCode: false
        });

        // Some servers don't support HEAD
        if (response.status() === 405 || response.status() === 501) {
          response = await this.request.get(url, {
            failOnStatusCode: false
          });
        }

        checkedLinks.set(url, response.status());

        if (response.status() >= 400) {

          brokenLinks.push({
            Blog: blogUrl,
            Link: url,
            Status: response.status()
          });

          console.log(`❌ ${response.status()} : ${url}`);

        } else {

          console.log(`✅ ${response.status()} : ${url}`);

        }

      } catch {

        checkedLinks.set(url, "FAILED");

        brokenLinks.push({
          Blog: blogUrl,
          Link: url,
          Status: "FAILED"
        });

        console.log(`❌ FAILED : ${url}`);
      }
    }
  }

  console.log("\n=================================");
  console.log(`Total Blogs Loaded : ${allBlogLinks.size}`);
  console.log(`Unique Links Checked : ${checkedLinks.size}`);
  console.log(`Broken Links : ${brokenLinks.length}`);
  console.log("=================================");

  if (brokenLinks.length) {
    console.table(brokenLinks);
  }

  return brokenLinks;
}


//   async validateBuyerProtection() {
//   try {
//     // =========================
//     // CLICK BUYER PROTECTION
//     // =========================
//     const buyerProtection = this.page.getByRole('img', { name: 'Trusted Shops Trustmark' });

//     await buyerProtection.waitFor({
//       state: 'visible',
//       timeout: 24000,
//     });

//     await buyerProtection.scrollIntoViewIfNeeded();

//     await buyerProtection.click();

//     console.log("✅ Clicked on Buyer Protection");

//     // =========================
//     // VALIDATE TRUSTMARK BUTTON
//     // =========================
//     const trustMarkButton = this.page.locator(
//       '#contentBoxWithLink_trustmark-98e3dadd90eb493088abdc5597a70810'
//     );

//     await trustMarkButton.waitFor({
//       state: 'visible',
//       timeout: 90000,
//     });

//     await expect(trustMarkButton).toBeVisible();

//     console.log("✅ Trustmark button is visible");

//     // =========================
//     // CLICK TRUSTMARK BUTTON
//     // =========================
//     await trustMarkButton.scrollIntoViewIfNeeded();

//     await trustMarkButton.click();

//     console.log("✅ Clicked on Trustmark button");

//     // =========================
//     // CLICK BACK BUTTON
//     // =========================
//     const backButton = this.page.locator(
//       'button[data-testid="maximized-trustbadge-back-button"]'
//     );

//     await backButton.waitFor({
//       state: 'visible',
//       timeout: 10000,
//     });

//     await expect(backButton).toBeVisible();

//     await backButton.click();

//     console.log("✅ Clicked on Back button");

//   } catch (error) {
//     console.error("❌ Buyer Protection validation failed:", error);
//     throw error;
//   }
// }
async validateCookiesBot() {
  try {

    // Wait for page load
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');

    // Wait until CookiesBot block is loaded
    await this.page.waitForSelector(
      '#CybotCookiebotDialogBodyContentTitle',
      {
        state: 'visible',
        timeout: 24000
      }
    );

    console.log('CookiesBot popup loaded successfully');

    // Customize button
    const customizeBtn = this.page.getByRole('button', {
      name: 'Customize'
    });

    // Validate + click
    if (await customizeBtn.isVisible()) {

      await customizeBtn.click();

      console.log('Clicked on Customize button');

      // Wait after click
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000);

    } else {

      console.log('Customize button not visible');

    }

  } catch (error) {

    console.log('CookiesBot validation failed:', error.message);

  }
}

async validateAllowAllCookies() {
  try {  
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');

    // Wait until CookiesBot block is loaded
    await this.page.waitForSelector(
      '#CybotCookiebotDialogBodyContentTitle',
      {
        state: 'visible',
        timeout: 24000
      }
    );

    console.log('CookiesBot popup loaded successfully');
    // Allow All button
    const allowAllBtn = this.page.getByRole('button', {
      name: 'Allow All'       
    });
    // Validate + click
    if (await allowAllBtn.isVisible()) { 
      await allowAllBtn.click();
      console.log('Clicked on Allow All button');             
}
  else {    
    console.log('Allow All button not visible');
  }
  } catch (error) {
    console.log('Allow All Cookies validation failed:', error.message);
  }
}

}

module.exports = BasePage;