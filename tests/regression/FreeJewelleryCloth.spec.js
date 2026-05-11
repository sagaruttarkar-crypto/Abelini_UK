const { test } = require('@playwright/test');
const BasePage = require('../../pages/BasePage');
const FreeJewelleryCloth = require('../../pages/FreeJewelleryCloth');

// test.describe('Free Jewellery Cloth Page Tests', () => {

  test('Validate Breadcrumb on Free Jewellery Cloth Page @regression', async ({ page, request }) => {
    const freeJewelleryCloth = new FreeJewelleryCloth(page, request);

    await freeJewelleryCloth.navigate('/information/free-jewellery-cloth');
    await freeJewelleryCloth.validateBreadcrumb();
    await freeJewelleryCloth.validateForm();

  });
