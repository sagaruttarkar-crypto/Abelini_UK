const { test } = require('@playwright/test');
const CartPage = require('../../pages/CartPage');

test.describe('Claim Free Tests', () => {

  test('Claim Free Return & Save Shopping Cart', async ({ page }) => {
    const cartPage = new CartPage(page);

    await cartPage.validateClaimFreeReturn(
      '/product/solitaire-engagement-rings-platinum-rose-white-gold-brilliant-cut-diamond-rine3170-lbg',
      {
        name: 'SAGAR',
        email: 'sagar.uttarkar@soluible.com'
      }
    );
  });

  
  test('Shoping Bag Funactionality Check', async ({ page }) => {
    const cartPage = new CartPage(page);

    await cartPage.SaveShopingBag(
      '/product/solitaire-engagement-rings-platinum-rose-white-gold-brilliant-cut-diamond-rine3170-lbg',
      {
        EMAIL_ADDRESS: 'sagar.uttarkar@soluible.com'
      }
    );
  });
    test('Add to bag Engagment Ring till buy a product ', async ({ page }) => {
    const cartPage = new CartPage(page);

    await cartPage.ValidateaddToCart_EngagementRing();
    
  });
  

});