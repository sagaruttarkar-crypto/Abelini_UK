const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

class BlogPage extends BasePage {

  constructor(page, request) {
    super(page, request);

    // ✅ Only define locator here
   this.breadcrumbTitle = page.locator('span[aria-current="page"]', { hasText: 'Blog' });
  }

  async validateBreadcrumb() {
    // ✅ Assertion should be here
    await expect(this.breadcrumbTitle).toBeVisible();
  }

  
}

module.exports = BlogPage;
