const { test, expect } = require('@playwright/test');
const { AccountPage } = require('../../pages/AccountPage');
const BasePage = require('../../pages/BasePage');

test.describe('Account Page Tests', () => {

  test(' Validate Account page loads with logged-in session @regression', async ({ page, request }) => {
    const account = new AccountPage(page, request);

    await account.navigateWithNetworkIdle('/account');
    await account.verifyURL(/account/);
  });

  test('Validate View Order History @regression', async ({ page, request }) => {
    const account = new AccountPage(page, request);

    await account.navigateWithNetworkIdle('/account');
    await account.openOrderHistory();
    await account.verifyURL(/orders/);

    // Using BasePage table utility
    const orderId = await account.getTableCell(0, 0);
    console.log('First Order ID:', orderId);
  });

  test('Validate Add New Address @regression', async ({ page, request }) => {
    const account = new AccountPage(page, request);

    await account.navigateWithNetworkIdle('/account');
    await account.openAddressBook();
    await account.addNewAddress();

    await account.verifyURL(/address-list/);
  });

  test('Validate Edit Address @regression', async ({ page, request }) => {
    const account = new AccountPage(page, request);
    await account.navigateWithNetworkIdle('/account');
    await account.editAddress();
  });

  test('Validate View Wishlist @regression', async ({ page, request }) => {
    const account = new AccountPage(page, request);

    await account.navigateWithNetworkIdle('/account');
    await account.openWishlist();
    await account.verifyURL(/wishlist/);

    const items = await account.getWishlistProducts();
    console.log('Wishlist Products:', items);
  });

  test('Validate Newsletter Subscription Page @regression', async ({ page, request }) => {
    const account = new AccountPage(page, request);

    await account.navigateWithNetworkIdle('/account');
    await account.openNewsletter();
    await account.verifyURL(/newsletter/);
  });

});