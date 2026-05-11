const { test, expect } = require('@playwright/test');

test.use({ storageState: 'auth.json' });

test('Logout invalidates session', async ({ page }) => {

  await page.goto('/account');

  await page.locator('text=Logout').click();

  await page.goto('/account');

  await expect(page).not.toHaveURL(/account/);

});