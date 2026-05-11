const { test, expect } = require('@playwright/test');
const ContactUsPage = require('../../pages/ContactUsPage');
const BasePage = require('../../pages/BasePage');

test.describe('Regression - Sprint 2 - Contact Us Page', () => {

  test('Validate Contact Us breadcrumb @regression', async ({ page, request }) => {

    const contactUsPage = new ContactUsPage(page, request);

    await contactUsPage.navigate('/information/contact-us');
    await contactUsPage.validateBreadcrumb();
  

  });

    test('Validate Contact Us Form @regression', async ({ page, request }) => {

    const contactUsPage = new ContactUsPage(page, request);

    await contactUsPage.navigate('/information/contact-us');
    await contactUsPage.validateContactForm();

  });

  test('Validate Broken Links @regression', async ({ page, request }) => {

    test.setTimeout(180000);

    const basePage = new BasePage(page, request);

    await basePage.navigate('/information/contact-us');

    const brokenLinks = await basePage.validateBrokenLinks();

    expect(
      brokenLinks,
      `Broken links found:\n${brokenLinks.join('\n')}`
    ).toHaveLength(0);

  });

});
