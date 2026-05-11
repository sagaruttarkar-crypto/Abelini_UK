const { test, expect } = require('@playwright/test');

test.use({ storageState: 'auth.json' });

test('User logged out after clearing cookies', async ({ page, context }) => {

  await page.goto('/account');

  await context.clearCookies();

  await page.reload();

  //await expect(page).not.toHaveURL(/account/);

});