const { test, expect } = require('@playwright/test');

test('Manual session tampering', async ({ page }) => {

await page.goto('/account');

// Inject fake token
await page.evaluate(() => {
localStorage.setItem('fake_token', '12345');
});

// Print localStorage after injection
const localStorageData = await page.evaluate(() => {
const data = {};
for (let i = 0; i < localStorage.length; i++) {
const key = localStorage.key(i);
data[key] = localStorage.getItem(key);
}
return data;
});

console.log('LocalStorage after injection:', localStorageData);

await page.reload();

// Validate user is not allowed to access account
await expect(page).not.toHaveURL('/account');

});
