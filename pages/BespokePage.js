const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');
const path = require('path');

class BespokePage extends BasePage {

  constructor(page, request) {
    super(page, request);  // Inherits links + validateAllLinks from BasePage

    this.breadcrumbTitle = page
      .getByLabel('Breadcrumb')
      .getByText('Bespoke', { exact: true });

    // Form locators
    this.nameInput = page.getByLabel('Your Name *');
    this.emailInput = page.getByLabel('E-Mail Address *');
    this.phoneInput = page.getByLabel('Your Phone *');
    this.messageInput = page.getByLabel('Enquiry *');
    this.chooseFile = page.locator('#bespoke_choose_file');
    this.BookConsultation  = page.getByRole('link', { name: 'Book Consultation' })

    this.submitButton = page.getByText('Send Your Message', { exact: true })

    // Success / confirmation
    this.successMessage = page.getByText('Send Your Message', { exact: true })
  }

  async validateBreadcrumb() {
    await expect(this.breadcrumbTitle).toBeVisible();
  }

  async ValidateForm() {

    await this.BookConsultation.click();

        // Wait for page to stabilize
   // await this.page.waitForLoadState('networkidle');

    // Ensure form fields are visible
    await expect(this.nameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.phoneInput).toBeVisible();
    await expect(this.messageInput).toBeVisible();
    await expect(this.chooseFile).toBeVisible();

    // Fill form
    await this.nameInput.fill('Automation Test User');
    await this.emailInput.fill('automation.test@example.com');
    await this.phoneInput.fill('9876543210');
    await this.messageInput.fill('This is an automated Playwright test for the bespoke form.');

    // File path
    const filePath = path.join(__dirname, '../configs/test-data/sample.png');

    // Upload file
    await this.chooseFile.setInputFiles(filePath);

    // Submit form
    await this.submitButton.click();

    // Validate success message
    await expect(this.successMessage).toBeVisible({ timeout: 10000 });
  }

}

module.exports = BespokePage;