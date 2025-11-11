import type { FullConfig } from "@playwright/test";
import { cleanupAllTestData, ensureQaUser } from "../utils/supabase-admin";

/**
 * Global teardown function that runs after all tests complete.
 * Cleans up all test data from the database including:
 * - Groups and group items
 * - User actions
 * - Test queries (prefixed with qa-group-e2e-)
 */
export default async function globalTeardown(_config: FullConfig): Promise<void> {
  console.log("\n🧹 Running global teardown...");

  try {
    const qaUser = await ensureQaUser();
    await cleanupAllTestData(qaUser.id);
    console.log("✅ Global teardown completed successfully\n");
  } catch (error) {
    console.error("❌ Global teardown failed:", error);
    throw error;
  }
}
