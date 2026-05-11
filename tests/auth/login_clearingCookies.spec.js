const { test, expect } = require('@playwright/test');

test.use({ storageState: 'auth.json' });
test('Check session cookies', async ({ page, context }) => {

  await page.goto('/account');

  const cookies = await context.cookies();

  console.log(cookies);
});