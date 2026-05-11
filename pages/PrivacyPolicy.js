const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

class PrivacyPolicy extends BasePage {

  constructor(page, request) {
    super(page, request);
    this.page = page;

    this.breadcrumbTitle = page
      .getByLabel('Breadcrumb')
      .getByText('Privacy Notice', { exact: true });

    // Form fields (bottom form)
    this.nameInput = page.getByLabel('Your Name *', { exact: true });
    this.emailInput = page.getByLabel('E-Mail Address *', { exact: true });
    this.messageInput = page.getByLabel('Enquiry *', { exact: true });

    this.submitButton = page.getByRole('button', { name: 'Submit' });

   // Success message
    this.successMessage = page.getByText('Your details submitted successfully!', { exact: true })
  }

  async validateBreadcrumb() {
    await expect(this.breadcrumbTitle).toBeVisible();
  }

  async validateForm() {

    // Scroll to bottom until form appears
     await this.page.waitForTimeout(1000);
    await this.page.locator('form').last().scrollIntoViewIfNeeded();

    // Wait for fields
    await this.nameInput.waitFor({ state: 'visible', timeout: 15000 });

    await expect(this.nameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.messageInput).toBeVisible();

    // Fill form
    await this.nameInput.fill('Automation Test User');
    await this.emailInput.fill('automation@test.com');
    await this.messageInput.fill('Testing privacy policy form using Playwright automation.');

    // Submit
    await this.submitButton.click();

    // Validate success
    await expect(this.successMessage).toBeVisible({ timeout: 10000 });
    console.log("Form submitted succsesfully ")
  }
}

module.exports = PrivacyPolicy;