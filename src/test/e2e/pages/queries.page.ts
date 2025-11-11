import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Page Object for the `/queries` view which powers manual group creation flows.
 * Provides helpers for selecting queries and launching downstream dialogs.
 */
export class QueriesPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly opportunityToggle: Locator;
  readonly createGroupButton: Locator;
  readonly selectedCounter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByRole("searchbox", { name: "Search queries" });
    this.opportunityToggle = page.getByLabel("Show only opportunity queries");
    this.createGroupButton = page.getByRole("button", { name: "Create Group" });
    this.selectedCounter = page.locator("text=/selected$/");
  }

  async goto(): Promise<void> {
    await this.page.goto("/queries");
    await expect(this.page.getByRole("heading", { name: "Query Performance Dashboard" })).toBeVisible();
  }

  async searchFor(term: string): Promise<void> {
    await this.searchInput.fill(term);
  }

  async toggleOpportunitiesOnly(checked: boolean): Promise<void> {
    const currentState = await this.opportunityToggle.getAttribute("data-state");
    const isChecked = currentState === "checked";
    if (isChecked !== checked) {
      await this.opportunityToggle.click();
    }
  }

  async selectQueryByText(queryText: string): Promise<void> {
    const checkbox = this.page.getByLabel(`Select query: ${queryText}`);
    await expect(checkbox).toBeVisible();
    const currentState = await checkbox.getAttribute("data-state");
    if (currentState !== "checked") {
      await checkbox.click();
    }
  }

  async openCreateGroupModal(): Promise<void> {
    await this.createGroupButton.click();
  }

  async expectSelectionCount(count: number): Promise<void> {
    await expect(this.page.getByText(`${count} selected`)).toBeVisible();
  }
}
