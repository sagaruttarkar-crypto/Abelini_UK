const { test } = require('@playwright/test');
const BasePage = require('../../pages/BasePage');
const CustomerStories = require('../../pages/CustomerStories');

// test.describe('About Us Page Tests', () => {

  test('Validate all Customer Stories @regression', async ({ page, request }) => {
    const customerStories = new CustomerStories(page, request);

    await customerStories.navigate('/customer-story');
    await customerStories.validateBreadcrumb();
    await customerStories.validateAllCustomerStoryCards();
  });

  test('Validate Broken Links on Customer Stories Page @regression', async ({ page, request }) => {
     test.setTimeout(180000);
    const basePage = new BasePage(page, request);

    await basePage.navigate('/customer-story');
    await page.waitForLoadState('domcontentloaded');

    await basePage.validateBrokenLinks();
  });


