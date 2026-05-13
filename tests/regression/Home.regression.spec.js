const { test, expect } = require('@playwright/test');
const HomePage = require('../../pages/HomePage');
const BasePage = require('../../pages/BasePage');
test.describe('Regression -Sprin2 Logo & Newsletter Validation', () => {

  test('Verify Abelini logo is visible and clickable @regression', async ({ page }) => {

    const home = new HomePage(page);

    // Navigate to home
    await home.navigate('/');

    // Validate logo visible
    await home.verifyHomeLoaded();

    // Click logo
    await home.logo.click();


  });


  test('Verify Newsletter subscription functionality @regression', async ({ page }) => {

    const home = new HomePage(page);

    // Navigate to home
    await home.navigate('/');

    // Fill newsletter
    await home.fillNewsletter('Sagar', 'Test123@email.com');

    // Click Subscribe
    await home.clickSubscribeBtn();

  });
  
  
  test('Verify Customer Reviews section @regression', async ({ page }) => {

    const home = new HomePage(page);

    // Navigate to home
    await home.navigate('/');
    // Validate Customer Reviews section
    await home.validateCustomerReviewsSection();
    

  });
 test('Validate footer links', async ({ page }) => {
  const home = new HomePage(page);

  await home.navigate('/');

  await home.validateFooterLinks();
});

test('Validate homepage image sections', async ({ page }) => {
  const home = new HomePage(page);

  await home.navigate('/');

  await home.validateImageSections();
});
test('Validate all header menus', async ({ page }) => {
  const home = new HomePage(page);

  await home.navigate('/');

  await home.validateHeaderMegaMenu();
});

test('Validate Buyer Protection', async ({ page }) => {
  const home = new HomePage(page);

  await home.navigate('/');

  await home.validateCookiesBot();
});

});
