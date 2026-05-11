class SitemapPage {
  constructor(page) {
    this.page = page;
  }

  async navigateToSitemap() {
    await this.page.goto('https://abelini-de-5e4c9d5a438332d59249.o2.myshopify.dev/sitemap');
  }

  // Get URLs from sitemap.xml
  async getSitemapLinks() {
    const urls = await this.page.evaluate(() => {
      const locs = Array.from(document.querySelectorAll('loc'));
      return locs.map(loc => loc.textContent);
    });
    return urls;
  }

  // Validate sitemap URL status
  async validateUrlStatus(url) {
    const response = await this.page.request.get(url);
    return response.status();
  }

  // Extract all links from a page
  async getLinksFromPage(url) {

    await this.page.goto(url, { waitUntil: 'domcontentloaded' });

    const links = await this.page.$$eval('a', elements =>
      elements
        .map(el => el.href)
        .filter(link => link && !link.includes('#'))
    );

    return [...new Set(links)];
  }

  // Validate list of links
async validateLinks(links) {
  const results = await Promise.allSettled(
    links.map(link =>
      this.page.request.get(link, {
        timeout: 30000,
        headers: { "User-Agent": "Mozilla/5.0" },
        failOnStatusCode: false
      })
    )
  );

  const validLinks = [];
  const brokenLinks = [];

  results.forEach((result, index) => {
    const link = links[index];

    if (result.status === "fulfilled") {
      const status = result.value.status();
      if (status >= 200 && status < 400) {
        validLinks.push({ link, status });
      } else {
        brokenLinks.push({ link, status });
      }
    } else {
      brokenLinks.push({ link, status: "FAILED" });
    }
  });

  return { validLinks, brokenLinks };
}

  // NEW: get only category URLs
  async getCategoryLinksFromSitemap() {

    const urls = await this.getSitemapLinks();

    const categories = urls.filter(url => url.includes('/collections/'));

    return [...new Set(categories)];
  }

async validateAllCategoriesFromSitemap() {

  await this.page.goto('https://abelini-de-5e4c9d5a438332d59249.o2.myshopify.dev/sitemap');

  const categoryLocator = this.page.locator('p.mt-2.text-center.text-p-18.uppercase.font-bold');

  const categoryCount = await categoryLocator.count();

  console.log(`Total Categories Found: ${categoryCount}`);

  let totalLinks = 0;
  let validCount = 0;
  let brokenCount = 0;

  for (let i = 0; i < categoryCount; i++) {

    const 
    categoryName = await categoryLocator.nth(i).innerText();

    console.log(`\nChecking Category: ${categoryName}`);

    try {

      // click category
      await categoryLocator.nth(i).click();

      await this.page.waitForLoadState('domcontentloaded');

      const currentUrl = this.page.url();
      console.log(`Opened URL: ${currentUrl}`);

      // get all links from category page
      const links = await this.page.$$eval('a', elements =>
        elements
          .map(el => el.href)
          .filter(link => link && !link.includes('#'))
      );

      const uniqueLinks = [...new Set(links)];

      console.log(`Links found: ${uniqueLinks.length}`);

      const { validLinks, brokenLinks } = await this.validateLinks(uniqueLinks);

      totalLinks += uniqueLinks.length;
      validCount += validLinks.length;
      brokenCount += brokenLinks.length;

      brokenLinks.forEach(b =>
        console.log(`❌ Broken: ${b.link} | Status: ${b.status}`)
      );

      // go back to sitemap
      await this.page.goto('https://abelini-de-5e4c9d5a438332d59249.o2.myshopify.dev/sitemap');

    } catch (error) {

      console.log(`❌ Failed to load category: ${categoryName}`);

    }

  }

  return {
    totalCategories: categoryCount,
    totalLinks,
    validLinks: validCount,
    brokenLinks: brokenCount
  };

}
}

module.exports = SitemapPage;