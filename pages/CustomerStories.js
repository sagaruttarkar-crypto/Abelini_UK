const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

class CustomerStories extends BasePage {

  constructor(page, request) {
    super(page, request);  // Inherits links + validateAllLinks from BasePage

    this.breadcrumbTitle = page
      .getByLabel('Breadcrumb')
      .getByText('Customer Stories', { exact: true });
  }

  async validateBreadcrumb() {
    await expect(this.breadcrumbTitle).toBeVisible();
  }
// ==============================
// CUSTOMER STORY CARDS VALIDATION
// ==============================


async validateAllCustomerStoryCards() {

  const cards = this.page.locator('div.col-span-1 a[href*="/customer-story/"]');
  const count = await cards.count();

  console.log(`Total Story Cards Found: ${count}`);
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {

    const card = cards.nth(i);

    const title = await card.locator('h3').innerText();
    const link = await card.getAttribute('href');

    console.log(`\nCard ${i + 1}`);
    console.log(`Title: ${title}`);
    console.log(`Link: ${link}`);

    // ✅ Validate image visible
    const image = card.locator('img').first();
    await expect(image).toBeVisible();

    // Scroll before clicking (important)
    //await card.scrollIntoViewIfNeeded();

    // Click card
    await Promise.all([
      this.page.waitForNavigation(),
      card.click()
    ]);

    // ✅ Validate navigation worked
    await expect(this.page).toHaveURL(new RegExp(link));

    console.log(`Navigation successful for: ${title}`);

    // Go back
    await this.page.goBack();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
}

module.exports = CustomerStories;
