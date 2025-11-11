## Group Management E2E Test Plan

### 1. Scope
- Validate MVP group workflows (`GRP-01` to `GRP-06`) end to end.
- Cover UI behaviour, API side-effects, and aggregated metric updates for manual and AI-tagged groups.
- Execute against Chromium desktop configuration only (per Playwright guidelines).

### 2. Test Environment
- **Browser**: Playwright Chromium (desktop) with `trace: "on-first-retry"`, `screenshot: "only-on-failure"`, `video: "retain-on-failure"`.
- **Auth**: Seed/sign-in reusable QA user through Supabase admin API; persist auth cookies in Playwright storage state fixture.
- **Data**: Seed baseline queries before each test; clean up groups and group items after execution using API helpers.
- **Tools**: Playwright test runner, REST client utilities, Supabase SQL seed scripts as needed.

### 3. Page Object Model
- **LoginPage**: Handles credential entry, submit, redirect assertions.
- **QueriesPage**: Exposes query table locators, selection checkboxes, `Create Group` button, selection counter, aria-live announcements.
- **CreateGroupModal**: Manages name input, validation messages, selected query preview, submit/cancel actions.
- **GroupsPage**: Provides search, sort headers, row actions (rename, view, delete), inline edit controls, pagination.
- **GroupDetailsPage**: Covers editable header, metrics summary cards, member table, add/remove query actions, confirm dialogs, live region.
- **AddQueriesModal**: Supports search, opportunity filtering, query selection badge, submit/cancel.

### 4. Test Scenarios
1. **GRP-01 Create Group**
   - Steps: Login → `/queries` → select two seeded queries → open `Create Group` modal → enter unique name → submit.
   - Assertions: Success toast, modal closes, new row on `/groups`, `/api/groups` returns created record, metrics summary reflects counts.
2. **GRP-02 Prevent Duplicate Name**
   - Steps: Reopen modal → submit existing group name.
   - Assertions: Inline validation / toast, request returns 409, no duplicate row created.
3. **GRP-03 Add Queries to Existing Group**
   - Steps: Navigate to group detail → open `Add Queries` modal → search/select additional query → submit.
   - Assertions: Selection badge shows count, success toast, member table count increases, metrics summary updates, `/api/groups/:id` shows new `queryCount`.
4. **GRP-04 Remove Query From Group**
   - Steps: Trigger remove icon in member table → confirm dialog → confirm removal.
   - Assertions: Dialog text references query, row removed, live region announces success, metrics summary recalculates, `/api/groups/:id/items` excludes query.
5. **GRP-05 Rename Group**
   - Steps: On `/groups`, use inline edit → enter new name → save.
   - Assertions: Input disables while saving, success toast, row shows new name, `/api/groups/:id` returns updated name, conflict handling verified.
6. **GRP-06 Delete Group**
   - Steps: Trigger delete (list or detail header) → confirm.
   - Assertions: Confirmation copy correct, success toast, row removed, detail view redirects to `/groups`, `/api/groups/:id` returns 404.

### 5. Implementation Notes
- Reuse authenticated storage state fixture for all specs.
- Annotate flows with `test.step` for trace readability; capture visual snapshots with `expect(page).toHaveScreenshot()` on key states.
- Prefer accessible locators (`getByRole`, `getByLabel`, `getByText`) for resilience.
- Use `expect.poll` for metrics assertions dependent on async recomputations.
- Run scenarios sequentially within describe to avoid shared state collisions; suite remains parallel-safe via isolated seed data.

