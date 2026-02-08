import { test as base, expect } from '@playwright/test';
import { UserSearchPage } from '../pages';

/**
 * Custom fixture that provides page objects.
 * Tests import `test` from this file.
 */
export const test = base.extend<{
  pages: {
    userSearch: UserSearchPage;
  };
}>({
  pages: async ({ page }, use) => {
    const pages = {
      userSearch: new UserSearchPage(page),
    };
    await use(pages);
  },
});

export { expect };