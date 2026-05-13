const { test, expect } = require('@playwright/test');

test('Validate Shopify login and save session', async ({ page }) => {

  await page.goto('/');

  // Click Login
  await page.getByText('Login', { exact: true }).first().click();

  // Fill email in store login form
  const emailInput = page.locator('#customer-authentication-web-email');
  await expect(emailInput).toBeVisible({ timeout: 15000 });

  await emailInput.fill('sagar.uttarkar@soulible.com');

  // Click Continue
  await page.locator('[data-testid="login-button"]').first().click();

  // Handle Shopify Identity popup (if appears)
  const popupEmail = page.locator('#IdentityEmailForm-input');

  if (await popupEmail.isVisible().catch(() => false)) {

    await popupEmail.fill('sagar.uttarkar@soulible.com');

    await page.getByRole('button', { name: /continue/i }).click();

  }

  // Wait until Shopify redirects back to account page
  await page.waitForURL('**/account**', { timeout: 200000 });

  // Wait for account page to fully load
  await page.waitForLoadState('networkidle');

  // Validate login success
  await expect(page).toHaveURL(/account/);

  // Additional check (optional but safer)
  await expect(page.locator('text=Logout')).toBeVisible();

  // Save session
  await page.context().storageState({ path: 'auth.json' });

  console.log('Session saved successfully');

});