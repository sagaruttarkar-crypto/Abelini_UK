const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

class VisitOurStore extends BasePage {

  constructor(page, request) {
    super(page, request);

    this.breadcrumbTitle = page
      .getByLabel('Breadcrumb')
      .getByText('Book An Appointment', { exact: true });

    this.collection = page.getByRole('radio', { name: 'collection' });

    this.commentbox = page.getByRole('textbox', {
      name: 'Comments(Please enter order no of your product and comments if you have any)'
    });

    this.continuebtn = page.getByRole('button', { name: 'Continue' });
  }

  async validateBreadcrumb() {
    await expect(this.breadcrumbTitle).toBeVisible();
  }

  async BookAndAppientment() {

    await this.collection.click();

    await expect(this.commentbox).toBeVisible();
    await this.commentbox.fill(`Automation Test - ${Date.now()}`);

    await this.continuebtn.click();

    // ✅ Wait for Calendly UI (reliable element)
    await expect(
      frame.getByText('Select a Date & Time')
    ).toBeVisible({ timeout: 20000 });

    // ✅ Select available date (INSIDE iframe)
    const availableDate = frame.locator(
      'button[aria-label*="Times available"]'
    );

    await availableDate.first().waitFor({
      state: 'visible',
      timeout: 90000
    });

    const dateCount = await availableDate.count();
    console.log('Available Dates:', dateCount);

    if (dateCount === 0) {
      throw new Error('No available dates found');
    }

    await availableDate.first().click();

    // ✅ Select time (INSIDE iframe)
    const availableTime = frame.locator(
      '[class*="time"]'
    );

    await availableTime.first().waitFor({
      state: 'visible',
      timeout: 60000
    });

    const timeCount = await availableTime.count();
    console.log('Available Times:', timeCount);

    if (timeCount === 0) {
      throw new Error('No available time slots found');
    }

    await availableTime.first().click();

    // ✅ Click Next (INSIDE iframe)
    const nextButton = frame.locator(
      'button:has-text("Next")'
    );

    await nextButton.waitFor({
      state: 'visible',
      timeout: 60000
    });

    await nextButton.click();
  }
}

module.exports = VisitOurStore;