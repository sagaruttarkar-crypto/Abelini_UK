const { test, expect } = require('@playwright/test');

test.use({ storageState: 'auth.json' });

test('Validate Open newsletter page directly @regression', async ({ page }) => {

  await page.goto('/account');

  // If session works, this page opens without login
  await expect(page).toHaveURL(/account/);

  await page.locator('a[href="/account/newsletter"]').click();

  await expect(page).toHaveURL(/newsletter/);
});