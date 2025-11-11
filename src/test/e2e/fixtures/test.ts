import { test as base, expect } from "@playwright/test";
import { cleanupGroupsForUser, ensureQaUser, resetBaselineQueries } from "../utils/supabase-admin";

type QaUserFixture = Awaited<ReturnType<typeof ensureQaUser>>;

interface Fixtures {
  qaUser: QaUserFixture;
}

export const test = base.extend<Fixtures>({
  qaUser: async ({}, use) => {
    const qaUser = await ensureQaUser();
    await use(qaUser);
  },
});

test.beforeEach(async ({ qaUser }) => {
  await cleanupGroupsForUser(qaUser.id);
  await resetBaselineQueries();
});

export { expect };
