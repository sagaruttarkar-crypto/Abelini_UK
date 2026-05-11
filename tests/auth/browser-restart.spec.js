const { test, expect } = require('@playwright/test');

test('Login persists after browser restart', async ({ browser }) => {

  const context = await browser.newContext({
    storageState: 'auth.json'
  });

  const page = await context.newPage();

  await page.goto('/account');

  await expect(page).toHaveURL(/account/);

});