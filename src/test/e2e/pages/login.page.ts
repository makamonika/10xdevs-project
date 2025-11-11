import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Page Object representing the `/login` route.
 * Encapsulates the primary authentication flow used across E2E scenarios.
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Password");
    this.submitButton = page.getByRole("button", { name: "Sign in" });
    this.forgotPasswordLink = page.getByRole("link", { name: "Forgot password?" });
    this.errorAlert = page.getByRole("alert");
  }

  async goto(): Promise<void> {
    await this.page.goto("/login");
    await expect(this.submitButton).toBeVisible();
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async assertInvalidCredentials(message: string): Promise<void> {
    await expect(this.errorAlert).toContainText(message);
  }
}
