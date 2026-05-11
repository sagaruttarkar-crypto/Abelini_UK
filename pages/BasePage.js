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

  async validateAllBlogsLinks() {

    const brokenLinks = [];
    const loadMoreBtn = this.page.getByText('>|', { exact: true });

    if (await loadMoreBtn.count() > 0) {

      console.log('Load More button found');

      while (await loadMoreBtn.first().isVisible().catch(() => false)) {
        await loadMoreBtn.first().scrollIntoViewIfNeeded();
        await loadMoreBtn.first().click();
        await this.page.waitForLoadState('networkidle');

        await this.page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
      }

    } else {

      console.log('Load More not found → Switching category');

      const categories = this.page.locator('.blog-category a');

      if (await categories.count() > 1) {
        await categories.nth(1).click();
        await this.page.waitForLoadState('domcontentloaded');
      }
    }

    const blogLinks = await this.page.$$eval('a[href*="/blog/"]', links =>
      [...new Set(
        links
          .map(link => link.getAttribute('href'))
          .filter(href =>
            href &&
            !href.includes('/blog?page=') &&
            !href.endsWith('/blog') &&
            !href.endsWith('/blog/')
          )
      )]
    );

    console.log(`Total blogs found: ${blogLinks.length}`);

    for (const blog of blogLinks) {

      const blogUrl = new URL(blog, this.page.url()).href;

      await this.page.goto(blogUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });

      const links = await this.page.$$eval('a[href]', elements =>
        [...new Set(elements.map(el => el.getAttribute('href')))]
      );

      for (const link of links) {

        if (!link ||
            link.startsWith('#') ||
            link.startsWith('mailto:') ||
            link.startsWith('tel:') ||
            link.startsWith('javascript:')
        ) continue;

        const url = new URL(link, this.page.url()).href;

        if (!url.includes('myshopify.dev')) continue;

        try {
          const response = await this.request.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });

          if (response.status() >= 400) {
            brokenLinks.push(`${response.status()} - ${url}`);
          }

        } catch {
          brokenLinks.push(`Failed - ${url}`);
        }
      }
    }

    console.log('-----------------------------------');
    console.log(`Total Broken Blog Links: ${brokenLinks.length}`);
    console.log('-----------------------------------');

    return brokenLinks;
  }

}

module.exports = BasePage;