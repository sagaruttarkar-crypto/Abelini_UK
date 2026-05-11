const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

class ContactUSPage extends BasePage {

  constructor(page, request) {
    super(page, request);  // Inherits links + validateAllLinks from BasePage

    this.breadcrumbTitle = page
      .getByLabel('Breadcrumb')
      .getByText('Customer Service', { exact: true });

    // Contact form fields
    this.nameInput = page.getByLabel('Your Name *', { exact: true })
    this.emailInput = page.getByLabel('E-Mail Address *', { exact: true })
    this.messageInput = page.getByLabel('Enquiry *', { exact: true })

    // Updated submit button
    this.submitButton = page.getByText('Send Message', { exact: true })

    // Success message
    this.successMessage = page.getByText('Your details submitted successfully!', { exact: true })
  }

  async validateBreadcrumb() {
    await expect(this.breadcrumbTitle).toBeVisible();
  }

  async validateContactForm() {

    // Wait for form to load
    await this.page.waitForSelector('form', { timeout: 15000 });
    await this.page.waitForTimeout(1000);

    // Scroll to form
    await this.submitButton.scrollIntoViewIfNeeded();

    // Validate fields
    await expect(this.nameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.messageInput).toBeVisible();

    // Fill form
    await this.nameInput.fill('Automation Test User');
    await this.emailInput.fill('automation.test@example.com');

    await this.messageInput.fill('This is an automated Playwright test for the contact form.');

    // Submit form
    await this.submitButton.click();

    // Validate success message
    await expect(this.successMessage).toBeVisible({ timeout: 10000 });
  }

}

module.exports = ContactUSPage;