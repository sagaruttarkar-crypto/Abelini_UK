const { test, expect } = require('@playwright/test');
const PrivacyPolicy = require('../../pages/PrivacyPolicy');

test.describe('Regression - Sprin2 Privacy Policy Page Breadcrumb', () => {

  test('Validate Privacy Policy page breadcrumb @regression', async ({ page }) => {

    const privacyPolicy = new PrivacyPolicy(page);

    // Navigate to Privacy Policy page
    await privacyPolicy.navigate('/information/privacy-policy');

    // Validate breadcrumb
    await privacyPolicy.validateBreadcrumb();
    await privacyPolicy.validateForm();


  });

});
