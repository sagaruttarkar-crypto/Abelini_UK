const { test, expect } = require('@playwright/test');

test.use({ storageState: 'auth.json' });

test('User remains logged in across multiple tabs', async ({ context }) => {

  // First tab
  const page1 = await context.newPage();
  await page1.goto('/account');

  await expect(page1).toHaveURL(/account/);

  // Second tab
  const page2 = await context.newPage();
  await page2.goto('/account');


// third tab
const page3 = await context.newPage();
  await page3.goto('/account');
  // Validate session shared
  await expect(page3).toHaveURL(/account/);

  console.log('User session shared across multiple tabs successfully');

});