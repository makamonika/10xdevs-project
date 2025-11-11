import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Page Object for the "Add Queries to Group" modal surfaced from group details.
 */
export class AddQueriesModal {
  readonly page: Page;
  readonly modal: Locator;
  readonly searchInput: Locator;
  readonly opportunityToggle: Locator;
  readonly addButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.getByRole("dialog", { name: "Add Queries to Group" });
    this.searchInput = this.modal.getByRole("searchbox", { name: "Search queries" });
    this.opportunityToggle = this.modal.getByLabel("Show only opportunity queries");
    this.addButton = this.modal.getByRole("button", { name: /^Add/ });
    this.cancelButton = this.modal.getByRole("button", { name: "Cancel" });
  }

  async expectOpen(): Promise<void> {
    await expect(this.modal).toBeVisible();
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
  }

  async selectQuery(queryText: string): Promise<void> {
    const checkbox = this.modal.getByLabel(`Select query: ${queryText}`);
    await expect(checkbox).toBeVisible();
    const currentState = await checkbox.getAttribute("data-state");
    if (currentState !== "checked") {
      await checkbox.click();
    }
  }

  async expectSelectionCount(count: number): Promise<void> {
    const label = `${count} ${count === 1 ? "query" : "queries"} selected`;
    await expect(this.modal.getByText(label)).toBeVisible();
  }

  async submit(): Promise<void> {
    await this.addButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
