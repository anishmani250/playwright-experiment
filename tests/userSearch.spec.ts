import { test } from '@playwright/test';
import { UserSearchPage } from '../pages/UserSearchPage';

test.describe('GH Users - User Search', () => {
  test('searches and verifies UI contains returned users', async ({ page }) => {
    const userSearch = new UserSearchPage(page);

    await userSearch.goto();
    await userSearch.searchUser('octocat');
  });
});