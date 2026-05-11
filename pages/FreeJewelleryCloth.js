const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

class FreeJewelleryCloth extends BasePage {

  constructor(page, request) {
    super(page, request);  // Inherits links + validateAllLinks from BasePage

    this.breadcrumbTitle = page
      .getByLabel('Breadcrumb')
      .getByText('Jewellery Cloth', { exact: true });
  }

  async validateBreadcrumb() {
    await expect(this.breadcrumbTitle).toBeVisible();
  }
async validateForm() {
  const firstName = this.page.getByRole('textbox', { name: 'First Name' });
  const lastName = this.page.getByRole('textbox', { name: 'Last Name' });
  const mobile = this.page.getByRole('textbox', { name: 'Mobile' });
  const email = this.page.getByRole('textbox', { name: 'E-Mail' });
  const address = this.page.getByRole('textbox', { name: 'Address line 1' });
  const address2 = this.page.getByRole('textbox', { name: 'Address line 2' });
  const city = this.page.getByRole('textbox', { name: 'City' });
  const postcode = this.page.getByRole('textbox', { name: 'Enter your postcode' });    

  await firstName.fill('Automation First_name');
  await lastName.fill('Automation Last_name');
  await mobile.fill('9876543210');
  await email.fill('automation.email@example.com');
  await address.fill('123 Automation Street');
  await address2.fill('Automation Street 2');
  await city.fill('Automation City');
  await postcode.fill('12345');

  await this.page.getByRole('button', { name: 'Submit' }).click();
  await this.page.pause();


}
}

module.exports = FreeJewelleryCloth;
