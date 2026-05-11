const { test } = require('@playwright/test');
const BasePage = require('../../pages/BasePage');
const AboutUsPage = require('../../pages/AboutUsPage');

// test.describe('About Us Page Tests', () => {

  test('ABL-457', async ({ page, request }) => {
    const aboutUsPage = new AboutUsPage(page, request);

    await aboutUsPage.navigate('/information/about-us');
    await aboutUsPage.validateBreadcrumb();
  });

  test('Validate Broken Links on About us Page @regression', async ({ page, request }) => {
     test.setTimeout(180000);
    const basePage = new BasePage(page, request);

    await basePage.navigate('/information/about-us');
    await page.waitForLoadState('domcontentloaded');

    await basePage.validateBrokenLinks();
  });

// });
