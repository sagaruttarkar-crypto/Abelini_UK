class LoginPage {
  constructor(page) {
    this.page = page;

    // this.loginBtn = page.getByText('Login').first();
    this.emailInput = page.locator('input[type="email"]');
    this.continueBtn = page.getByRole('button', { name: /continue/i });
  }

  async openSite() {
    await this.page.goto('/');
  }

  async clickLogin() {
    await this.loginBtn.click();
  }

  async enterEmail(email) {
    await this.emailInput.fill(email);
  }

  async clickContinue() {
    await this.continueBtn.click();
  }
}

module.exports = LoginPage;