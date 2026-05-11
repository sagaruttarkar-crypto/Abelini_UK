const { test, expect } = require('@playwright/test');
const RingSizeGuidePage = require('../../pages/RingSizeGuidePage');
const BasePage = require('../../pages/BasePage');

test.describe('Regression - Sprint 2 - Ring Size Guide Page', () => {

 test(' Validate Ring Size Guide Page Validation @regression', async ({ page }) => {
  const ringSizeGuidePage = new RingSizeGuidePage(page);

  await page.goto('/information/ring-size-guide');

  await ringSizeGuidePage.validateBreadcrumb();
  await ringSizeGuidePage.validateDownloadButtons();
  await ringSizeGuidePage.validateFreeRingSizerForm();
});

  test('Validate Broken Links @regression', async ({ page, request }) => {

    test.setTimeout(180000);

    const basePage = new BasePage(page, request);

    await basePage.navigate('/information/ring-size-guide');

    const brokenLinks = await basePage.validateBrokenLinks();

    expect(
      brokenLinks,
      `Broken links found:\n${brokenLinks.join('\n')}`
    ).toHaveLength(0);

  });

});
