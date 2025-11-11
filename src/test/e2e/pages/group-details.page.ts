import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Page Object for `/groups/:id` detail experience.
 * Provides helpers for renaming, deleting, and managing member queries.
 */
export class GroupDetailsPage {
  readonly page: Page;
  readonly headerName: Locator;
  readonly editNameButton: Locator;
  readonly deleteGroupButton: Locator;
  readonly addQueriesButton: Locator;
  readonly metricsSummary: Locator;

  constructor(page: Page) {
    this.page = page;
    this.headerName = page.getByTestId("group-title");
    this.editNameButton = page.getByRole("button", { name: "Edit group name" });
    this.deleteGroupButton = page.getByRole("button", { name: "Delete group" });
    this.addQueriesButton = page.getByRole("button", { name: "Add Queries" });
    this.metricsSummary = page.locator('[role="group"][aria-label*="Queries"]');
  }

  async expectLoaded(groupName: string): Promise<void> {
    await expect(this.headerName).toHaveText(groupName);
    await expect(this.metricsSummary).toBeVisible();
  }

  async renameGroup(newName: string): Promise<void> {
    await this.editNameButton.click();
    const input = this.page.getByLabel("Group name");
    await input.fill(newName);
    await this.page.getByRole("button", { name: "Save group name" }).click();
  }

  async deleteGroup(confirm = true): Promise<void> {
    await this.deleteGroupButton.click();
    const dialog = this.page.getByRole("dialog", { name: "Delete Group" });
    await expect(dialog).toBeVisible();
    if (confirm) {
      await dialog.getByRole("button", { name: "Delete" }).click();
    } else {
      await dialog.getByRole("button", { name: "Cancel" }).click();
    }
  }

  async openAddQueriesModal(): Promise<void> {
    await this.addQueriesButton.click();
    await expect(this.page.getByRole("dialog", { name: "Add Queries to Group" })).toBeVisible();
  }

  async removeQuery(queryText: string): Promise<void> {
    await this.page.getByRole("button", { name: `Remove ${queryText} from group` }).click();
    const dialog = this.page.getByRole("dialog", { name: "Remove Query from Group" });
    await expect(dialog).toContainText(`"${queryText}"`);
    await dialog.getByRole("button", { name: "Remove" }).click();
  }

  async expectQueryPresent(queryText: string): Promise<void> {
    await expect(this.page.getByRole("row", { name: new RegExp(queryText) })).toBeVisible();
  }

  async expectQueryAbsent(queryText: string): Promise<void> {
    const row = this.page.getByRole("row", { name: new RegExp(queryText) });
    await expect(row).toHaveCount(0);
  }

  async expectQueryCount(count: number): Promise<void> {
    await expect(this.page.getByRole("group", { name: `Queries: ${count}` })).toBeVisible();
  }

  async expectMetricsSummary(params: {
    impressions: number;
    clicks: number;
    ctr: number;
    avgPosition: number;
  }): Promise<void> {
    const { impressions, clicks, ctr, avgPosition } = params;
    await expect(this.page.getByRole("group", { name: `Impressions: ${impressions.toFixed(0)}` })).toBeVisible();
    await expect(this.page.getByRole("group", { name: `Clicks: ${clicks.toFixed(0)}` })).toBeVisible();
    await expect(this.page.getByRole("group", { name: `CTR: ${(ctr * 100).toFixed(2)}%` })).toBeVisible();
    await expect(this.page.getByRole("group", { name: `Avg Position: ${avgPosition.toFixed(1)}` })).toBeVisible();
  }
}
