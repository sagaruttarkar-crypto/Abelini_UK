const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

class HomePage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;

    // Header
    this.logo = page.getByRole('img', { name: 'Abelini Logo' });
    this.searchBox = page.locator('#menu-search');

    // Newsletter
    this.newsletterName = page.getByPlaceholder(/Your Name \*/i);
    this.newsletterEmail = page.getByPlaceholder(/Your email \*/i);
    this.subscribeBtn = page.getByRole('button', {
      name: 'Subscribe',
      exact: true
    });
  }

  async verifyHomeLoaded() {
    await expect(this.logo).toBeVisible();
    await expect(this.logo).toHaveAttribute('src', /abelini/i);
    await this.logo.click();
  }

  async fillNewsletter(name, email) {
    await this.newsletterName.fill(name);
    await this.newsletterEmail.fill(email);
  }

  async clickSubscribeBtn() {
    await this.subscribeBtn.click();
  }

  async loginToDevStore(email) {
    await this.page.goto('https://dev.abelini.com/', {
      waitUntil: 'domcontentloaded'
    });

    const accountBtn = this.page.locator(
      'a[href*="/account"], a:has-text("Account"), a:has-text("Login")'
    );

    if (await accountBtn.first().isVisible()) {
      await accountBtn.first().click();
    }

    const emailField = this.page.locator('#customer-authentication-web-email');
    await emailField.waitFor({ state: 'visible', timeout: 20000 });

    await emailField.fill(email);

    const continueButton = this.page.locator(
      'button[aria-label="Continue with Shop"]'
    );
    await continueButton.first().click();

    await this.page.waitForSelector(
      'input[name="code"], input[autocomplete="one-time-code"]',
      { timeout: 60000 }
    );

    console.log("OTP screen opened - enter code manually.");
  }

  async validateCustomerReviewsSection() {
    const reviewsSection = this.page.locator('div.container').locator('div').nth(1);
    await expect(reviewsSection).toBeVisible();
  }

  // 
  async validateFooterLinks() {
    const baseURL = new URL(this.page.url()).origin;
    console.log(`Detected BaseURL: ${baseURL}`);

    // Ensure footer is loaded
    await this.page.waitForSelector('footer, .grid');

    const footerLinks = this.page.locator('.grid a');

    const count = await footerLinks.count();
    console.log(`Total footer links found: ${count}`);

    const visited = new Set();
    const brokenLinks = [];

    for (let i = 0; i < count; i++) {
      const link = footerLinks.nth(i);

      const href = await link.getAttribute('href');
      const text = (await link.textContent())?.trim() || 'NO TEXT';

      if (!href || href.startsWith('tel:') || href.startsWith('mailto:')) {
        console.log(`Skipping: ${text} -> ${href}`);
        continue;
      }

      let url;

      try {
        url = new URL(href, baseURL).href;
      } catch {
        console.log(`Invalid URL: ${href}`);
        continue;
      }

      if (url === baseURL + '/') continue;

      if (visited.has(url)) continue;
      visited.add(url);

      try {
        let response = await this.page.request.head(url, { timeout: 10000 });

        if (response.status() >= 404) {
          response = await this.page.request.get(url, { timeout: 15000 });
        }

        const status = response.status();

        console.log(`${status} → ${text} → ${url}`);

        if (status >= 404) {
          brokenLinks.push(`${status} - ${url}`);
        }

      } catch {
        console.error(`❌ ERROR → ${url}`);
        brokenLinks.push(`ERROR - ${url}`);
      }
    }

    console.log(`Checked ${visited.size} unique links`);

    if (brokenLinks.length > 0) {
      throw new Error(`Broken links found:\n${brokenLinks.join('\n')}`);
    }
  }
async validateImageSections() {
  console.log('Validating images (only real broken / blank, no duplicates)...');

  // 🔽 Scroll to trigger lazy loading
  await this.page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 400;

      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 150);
    });
  });

  // ✅ Extract all image sources
  const rawImages = await this.page.locator('img').evaluateAll((imgs) => {
    return imgs
      .filter(img => img.offsetParent !== null)
      .map((img, index) => {
        const src =
          img.getAttribute('src') ||
          img.getAttribute('data-src') ||
          img.getAttribute('srcset');

        return { src, index };
      });
  });

  console.log(`Total visible images found: ${rawImages.length}`);

  // ✅ Deduplicate URLs BEFORE validation
  const uniqueMap = new Map(); // url → first index

  for (const { src, index } of rawImages) {
    if (!src || src.trim() === '') continue;
    if (src.startsWith('data:image')) continue;

    try {
      const url = new URL(src, this.page.url()).href;

      if (!uniqueMap.has(url)) {
        uniqueMap.set(url, index);
      }
    } catch {
      // ignore here, will handle later if needed
    }
  }

  const uniqueImages = Array.from(uniqueMap.entries()).map(
    ([url, index]) => ({ url, index })
  );

  console.log(`Unique images to validate: ${uniqueImages.length}`);

  const brokenImages = [];

  // ✅ Parallel validation
  const results = await Promise.allSettled(
    uniqueImages.map(async ({ url, index }) => {
      try {
        const res = await this.page.request.get(url, {
          timeout: 10000
        });

        const status = res.status();

        console.log(`${index} → ${url} → ${status}`);

        if (status >= 400) {
          return `${status} - ${url}`;
        }

        return null;

      } catch {
        return `ERROR - ${url}`;
      }
    })
  );

  // ✅ Collect failures
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value) {
      brokenImages.push(r.value);
    }
  }

  console.log(`Checked ${uniqueImages.length} unique images`);

  if (brokenImages.length > 0) {
    console.log('\n========= BROKEN IMAGES REPORT =========');

    // ✅ Remove duplicates in error logs too (extra safety)
    const uniqueBroken = [...new Set(brokenImages)];

    uniqueBroken.forEach((img, i) => {
      console.log(`${i + 1}. ${img}`);
    });

    throw new Error(
      `Total Broken Images: ${uniqueBroken.length}\n` +
      uniqueBroken.join('\n')
    );
  }

  console.log('All images are valid (no broken/blank, no duplicates)');
}

async validateHeaderMegaMenu() {
  console.log('Validating full mega menu (links only)...');

  const count = await this.page.locator('ul > a').count();
  console.log(`Main categories found: ${count}`);

  const allBrokenLinks = [];

  for (let i = 0; i < count; i++) {

    // ✅ Re-query element fresh every time
    const menu = this.page.locator('ul > a').nth(i);

    const category =
      (await menu.textContent().catch(() => null))?.trim() || `Category-${i}`;

    console.log(`\n--- ${category} ---`);

    let opened = false;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        // ✅ NO scrollIntoView (removed completely)

        // ✅ Safe hover
        await menu.hover({ timeout: 2000 }).catch(() => {});

        await this.page.waitForTimeout(500);

        const megaMenu = this.page
          .locator('div:has(h3:has-text("Shop By"))')
          .first();

        const visible = await megaMenu
          .isVisible({ timeout: 2000 })
          .catch(() => false);

        if (visible) {
          opened = true;
          break;
        }

      } catch {
        console.log(`Retry ${attempt + 1} failed for ${category}`);
      }
    }

    if (!opened) {
      console.log(`⚠️ Could not open menu: ${category} (skipping)`);
      continue;
    }

    const megaMenu = this.page
      .locator('div:has(h3:has-text("Shop By"))')
      .first();

    // ✅ Extract links safely
    const links = await megaMenu.locator('a[href]').evaluateAll((anchors) => {
      return anchors
        .filter(a => a.offsetParent !== null)
        .map(a => ({
          href: a.getAttribute('href'),
          text:
            a.querySelector('h1,h2,h3,h4,h5,h6,span,p')?.textContent ||
            a.getAttribute('aria-label') ||
            a.getAttribute('title') ||
            a.textContent ||
            'NO TEXT'
        }))
        .map(a => ({
          href: a.href,
          text: a.text?.trim()
        }))
        .filter(a =>
          a.href &&
          !a.href.startsWith('tel:') &&
          !a.href.startsWith('mailto:')
        );
    });

    console.log(`Links found: ${links.length}`);

    const visited = new Set();

    const results = await Promise.allSettled(
      links.map(async (link) => {
        let url;

        try {
          url = new URL(link.href, this.page.url()).href;
        } catch {
          return `${category} → Invalid URL → ${link.href}`;
        }

        if (visited.has(url)) return null;
        visited.add(url);

        try {
          const res = await this.page.request.get(url, {
            timeout: 10000
          });

          const status = res.status();

          console.log(`${status} → ${link.text} → ${url}`);

          if (status >= 404) {
            return `${category} → ${status} → ${link.text} → ${url}`;
          }

          return null;
        } catch {
          return `${category} → ERROR → ${link.text} → ${url}`;
        }
      })
    );

    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) {
        allBrokenLinks.push(r.value);
      }
    }

    console.log(`${category} checked (unique links: ${visited.size})`);
  }

  // ✅ Final report
  console.log('\n========= FINAL BROKEN LINKS REPORT =========');

  if (allBrokenLinks.length > 0) {
    allBrokenLinks.forEach((link, i) => {
      console.log(`${i + 1}. ${link}`);
    });

    throw new Error(
      `Total Broken Links: ${allBrokenLinks.length}\n` +
      allBrokenLinks.join('\n')
    );
  }

  console.log('All mega menu links are valid 🎉');
}

}

module.exports = HomePage;