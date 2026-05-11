const BasePage = require('./BasePage');

class AccountPage extends BasePage {
  constructor(page) {
    super(page);

    // Navigation Links
    this.orderHistoryLink = page.getByRole('link', { name: '- View your order history' });
    this.addressBookLink = page.getByRole('link', { name: '- Modify your address book entries' });
    this.wishlistLink = page.getByRole('link', { name: '- My Wishlist' });
    this.newsletterLink = page.getByRole('link', { name: '- Subscribe / unsubscribe to newsletter' });

    // Address Section
    this.newAddressBtn = page.getByRole('link', { name: 'New Address' });
    this.firstName = page.getByRole('textbox', { name: 'First Name *' });
    this.lastName = page.getByRole('textbox', { name: 'Last Name *' });
    this.company = page.getByRole('textbox', { name: 'Company' });
    this.phone = page.getByRole('textbox', { name: 'Phone' });
    this.addressLine1 = page.getByRole('textbox', { name: 'Address Line 1 *' });
    this.city = page.getByRole('textbox', { name: 'City *' });
    this.stateDropdown = page.locator('#state');
    this.zip = page.getByRole('textbox', { name: 'Zip *' });
    this.defaultAddress = page.getByLabel('Set as Default Address');
    this.backBtn = page.getByText('Back', { exact: true });

    // Edit Address
    this.editBtn = page.getByRole('link', { name: 'Edit' });
    this.continueBtn = page.getByRole('button', { name: 'Continue' });

    // Orders Table
    this.ordersTableRows = page.locator('tbody tr');

    // Wishlist Items
    this.wishlistItems = page.getByRole('heading', { level: 3 });

    // continue button on newsletter page
    this.newsletterContinueBtn = page.getByRole('button', { name: 'Continue' });
  }

  async openAccount() {
    await this.navigate('/account');
    await this.verifyURL(/account/);
  }

  async openOrderHistory() {
    await this.orderHistoryLink.click();
    
  }

  async openAddressBook() {
    await this.addressBookLink.click();
  }

  async addNewAddress() {
    await this.newAddressBtn.click();

    await this.firstName.fill('Test');
    await this.lastName.fill('Sagar');
    await this.company.fill('TestingQA');
    await this.phone.fill('9082767656');
    await this.addressLine1.fill('More London Riverside, London SE1 2AF, United Kingdom.');
    await this.city.fill('London');
    await this.stateDropdown.selectOption('Western Australia');
    await this.zip.fill('2000');

    await this.defaultAddress.click();
    await this.backBtn.click();
  }

  async editAddress() {
    await this.addressBookLink.click();
    await this.editBtn.first().click();
    await this.firstName.clear();
    await this.firstName.fill('SAGAR');
    await this.continueBtn.click();
  }

  async getFirstOrderId() {
    return await this.ordersTableRows.first().locator('td').nth(0).textContent();
  }

  async openWishlist() {
    await this.wishlistLink.click();
    
  }

  async getWishlistProducts() {
    return await this.wishlistItems.allTextContents();
  }

  async openNewsletter() {
    await this.newsletterLink.click();
      await this.newsletterContinueBtn.click();

  }
}

module.exports = { AccountPage };