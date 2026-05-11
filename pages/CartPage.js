const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

class cartPage extends BasePage {

  constructor(page, request) {
    super(page, request);  // Inherits links + validateAllLinks from BasePage

    this.Btnclaimform = page.getByRole('button', { name: 'Claim Free Return & Save Shopping Cart' });
    this.NAME =page.getByRole('textbox', { name: 'NAME' })
    this.EMAIL= page.getByRole('textbox', { name: 'EMAIL' });
    this.EMAIL_ADDRESS=page.getByRole('textbox', { name: 'Email Address :' })
    this.SUBMIT=page.getByText('Send Email', { exact: true })
    this.addToCartBtn = page.getByRole('button', { name: 'Add to Cart' }).first();
    this.SaveShopingCartBtn = page.getByText('Save Shopping Bag', { exact: true })
    this.SendEmailBtn = page.getByRole('button', { name: 'Send Email' })

  }


async validateClaimFreeReturn() {
  await this.page.goto(
    '/product/solitaire-engagement-rings-platinum-rose-white-gold-brilliant-cut-diamond-rine3170-lbg',
    { waitUntil: 'domcontentloaded' }
  );

  await this.addToCartBtn.waitFor({ state: 'visible', timeout: 10000 });
  await this.addToCartBtn.click();

    
  // Step 1: Open popup
  await this.Btnclaimform.click();

  // Step 2: Wait for popup
const popup = this.page.locator('[role="dialog"]').last();
await expect(popup).toBeVisible({ timeout: 10000 });

  // Step 3: Fill داخل popup (scoped correctly)
  await popup.getByPlaceholder('Name').fill('SAGAR');
  await popup.getByPlaceholder('Email').fill('sagar.uttarkar@soluible.com');

  // Step 4: Submit
  await popup.getByRole('button', { name: /submit/i }).click();
}
async SaveShopingBag() {
  await this.page.goto(
    '/product/solitaire-engagement-rings-platinum-rose-white-gold-brilliant-cut-diamond-rine3170-lbg',
    { waitUntil: 'domcontentloaded' }
  );

  await this.addToCartBtn.waitFor({ state: 'visible', timeout: 10000 });
  await this.addToCartBtn.click();



  await this.SaveShopingCartBtn.waitFor({ state: 'visible', timeout: 10000 });
  await this.SaveShopingCartBtn.click();

  const popup = this.page.locator('[role="dialog"]').last();
await expect(popup).toBeVisible({ timeout: 10000 });

  await this.EMAIL_ADDRESS.waitFor({ state: 'visible', timeout: 10000 });
  await this.EMAIL_ADDRESS.fill('sagar.uttarkar@soluible.com');
  await this.SUBMIT.waitFor({ state: 'visible', timeout: 10000 });
  await this.SUBMIT.click();
    
 
}
async ValidateaddToCart_EngagementRing() {
  await this.page.goto(
    '/product/platinum-and-yellow-white-gold-diamond-stud-earrings-ern00020-lbg#metal=GL_9K_W',
    { waitUntil: 'domcontentloaded' }
  );
  const addToCartBtn = this.page.getByRole('button', { name: 'Add to Cart' }).first();
await addToCartBtn.click();
  // ✅ Validate redirect to cart
  await this.page.waitForURL('**/cart');
  await expect(this.page).toHaveURL(/.*\/cart/);
 const proceedToCheckoutBtn = this.page.getByText('Proceed to Checkout', { exact: true });
  await proceedToCheckoutBtn.waitFor({ state: 'visible', timeout: 10000 });
  await proceedToCheckoutBtn.click();
  { waitUntil: 'domcontentloaded' }

  /// discount code is usually in a separate iframe, so we need to switch to that iframe first

  await this.page.locator('#ReductionsInput0').fill('Tms99');
  await this.page.getByRole('button', { name: 'Apply Discount Code' }).click();

await this.page
  .frameLocator('iframe[title="Field container for: Card number"]')
  .getByPlaceholder('Card number')
  .fill('4242 4242 4242 4242');

/////expry date of card is usually in a separate iframe, so we need to switch to that iframe first


const expiryInput = this.page
  .frameLocator('iframe[title="Field container for: Expiration date (MM / YY)"]')
  .locator('#expiry');

await expiryInput.fill('12 / 30');

//// CVV is usually in a separate iframe, so we need to switch to that iframe first

const cvvInput = this.page
  .frameLocator('iframe[title="Field container for: Security code"]')
  .locator('#verification_value');

await cvvInput.fill('123');

// Click the "Complete order" button
await this.page
  .frameLocator('iframe[name^="card-fields-name"]')
  .locator('input[name="name"]')
  .fill('Automation Bot ');

  const payBtn = this.page.getByRole('button', { name: 'Pay now' });

await payBtn.waitFor({ state: 'visible' });
await payBtn.click();
await this.page.waitForURL('**/order-confirmation**', { timeout: 30000 });
await expect(this.page).toHaveURL(/.*\/order-confirmation/);    

   }



}

module.exports = cartPage;
