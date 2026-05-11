const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

class AboutUsPage extends BasePage {

  constructor(page, request) {
    super(page, request);  // Inherits links + validateAllLinks from BasePage

    this.breadcrumbTitle = page
      .getByLabel('Breadcrumb')
      .getByText('About abelini diamond jewellery', { exact: true });
  }

  async validateBreadcrumb() {
    await expect(this.breadcrumbTitle).toBeVisible();
  }

}

module.exports = AboutUsPage;
