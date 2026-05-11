const { test, expect } = require('@playwright/test');

test.use({ storageState: 'auth.json' });

test('Session expiry behaviour', async ({ page, context }) => {

  await page.goto('/account');

  await expect(page).toHaveURL(/account/);

  // Simulate session expiry
  await context.clearCookies();

  await page.reload();

  await expect(page).not.toHaveURL(/account/);

});