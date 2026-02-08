import { test as base, expect } from '@playwright/test';
import { UserSearchPage } from '../pages';

/**
 * Custom fixture that provides page objects.
 * Built-in fixtures like `request` are still available to tests.
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
