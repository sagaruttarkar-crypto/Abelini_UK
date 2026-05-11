const { test, expect } = require('@playwright/test');
const BespokePage = require('../../pages/BespokePage');
const BasePage = require('../../pages/BasePage');

test.describe('Regression - Sprint 2 - Bespoke Page', () => {

  test('Validate Bespoke breadcrumb @regression', async ({ page, request }) => {

    const bespokePage = new BespokePage(page, request);

    await bespokePage.navigate('/information/bespoke');
    await bespokePage.validateBreadcrumb();


  });

    test('Validate Bespoke Form @regression', async ({ page, request }) => {

    const bespokePage = new BespokePage(page, request);

    await bespokePage.navigate('/information/bespoke');
    await bespokePage.ValidateForm();

  });


  test('Validate Broken Links @regression', async ({ page, request }) => {

    test.setTimeout(180000);

    const basePage = new BasePage(page, request);

    await basePage.navigate('/information/bespoke');

    const brokenLinks = await basePage.validateBrokenLinks();

    expect(
      brokenLinks,
      `Broken links found:\n${brokenLinks.join('\n')}`
    ).toHaveLength(0);

  });

});


