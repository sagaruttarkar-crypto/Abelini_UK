const { test, expect } = require('@playwright/test');

test.use({ storageState: 'auth.json' });

test('Open account page in new tab', async ({ browser }) => {

  const context = await browser.newContext({ storageState: 'auth.json' });

  const page1 = await context.newPage();
  await page1.goto('/account');

  const page2 = await context.newPage();
  await page2.goto('/account');

   const page3 = await context.newPage();
  await page3.goto('/account');

  await expect(page2).toHaveURL(/account/);
});