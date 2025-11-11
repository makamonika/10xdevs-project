import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Page Object for the "Create New Group" modal launched from the Queries page.
 */
export class CreateGroupModal {
  readonly page: Page;
  readonly modal: Locator;
  readonly nameInput: Locator;
  readonly cancelButton: Locator;
  readonly submitButton: Locator;
  readonly validationAlert: Locator;
  readonly selectedQueriesList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.getByRole("dialog", { name: "Create New Group" });
    this.nameInput = this.modal.getByLabel("Group Name");
    this.cancelButton = this.modal.getByRole("button", { name: "Cancel" });
    this.submitButton = this.modal.getByRole("button", { name: /Create Group/i });
    this.validationAlert = this.modal.getByRole("alert");
    this.selectedQueriesList = this.modal.locator("ul");
  }

  async expectOpen(): Promise<void> {
    await expect(this.modal).toBeVisible();
  }

  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async expectValidationMessage(message: string): Promise<void> {
    await expect(this.validationAlert).toContainText(message);
  }

  async expectSelectedQueriesContain(text: string): Promise<void> {
    await expect(this.selectedQueriesList).toContainText(text);
  }
}
