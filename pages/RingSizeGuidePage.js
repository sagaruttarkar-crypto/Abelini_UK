const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

class RingSizeGuidePage extends BasePage {

  constructor(page, request) {
    super(page, request);   // Inherits links + validateAllLinks from BasePage

    this.breadcrumbTitle = page
      .getByLabel('Breadcrumb')
      .getByText('Ring Size Guide', { exact: false });

    this.downloadRingSizerBtn = page.getByText('Download Ring Sizer', { exact: true });
    this.freeRingSizerBtn = page.getByText('Free Ring Sizer', { exact: true });

    // Form fields (after clicking Free Ring Sizer)
    this.firstnameInput = page.getByPlaceholder('First Name *', { exact: true });
    this.lastnameInput = page.getByPlaceholder('Last Name *', { exact: true });
    this.phoneInput = page.getByPlaceholder('Mobile *', { exact: true });
    this.emailInput= page.getByRole('textbox', { name: 'E-mail Address *' });
    this.addressInput1 = page.locator('#address_1');
    this.addressInput2 = page.locator('#address_2'); 
    this.cityInput =page.getByRole('textbox', { name: 'City' });
    this.postcodeInput = page.locator('#postcode')

    this.submitButton = page.locator('button:has-text("Submit")');
    this.successMessage = page.getByText('Enquiry submitted successfully.', { exact: true });
  }

  async validateBreadcrumb() {
    await expect(this.breadcrumbTitle).toBeVisible();
  }

  async validateDownloadButtons() {
    await expect(this.downloadRingSizerBtn).toBeVisible();
    await expect(this.freeRingSizerBtn).toBeVisible();
  }

  async validateFreeRingSizerForm() {

    // Click Free Ring Sizer button
    await this.freeRingSizerBtn.click();

    // Wait for form to appear
    await this.page.waitForSelector('form', { timeout: 15000 });

    // Scroll to form
    await this.firstnameInput.scrollIntoViewIfNeeded();

    // Fill form
    await this.firstnameInput.fill('Automation First_name');
     await this.lastnameInput.fill('Automation Last_name');
       if (await this.phoneInput.isVisible()) {
      await this.phoneInput.fill('9876543210');
    }

   await this.page.waitForSelector('form', { timeout: 15000 });
    await this.emailInput.fill('automation.test@example.com');

     await this.page.waitForSelector('form', { timeout: 15000 });

    if (await this.addressInput1.isVisible()) {
      await this.addressInput1.fill('Test Address 123');
    }
       if (await this.addressInput2.isVisible()) {
      await this.addressInput2.fill('Test Address 123567890');
    }

    if (await this.cityInput.isVisible()) {
      await this.cityInput.fill('London');
    }

    if (await this.postcodeInput.isVisible()) {
      await this.postcodeInput.fill('EC1A 1BB');
    }

    // Submit form
     await this.page.waitForSelector('form', { timeout: 15000 });
    await this.submitButton.click();

    // Validate success message
    await expect(this.successMessage).toBeVisible({ timeout: 10000 });
  }

}

module.exports = RingSizeGuidePage;