import { test } from '../fixtures/pagesFixture';

test('User search works @pages', async ({ pages }) => {
  await pages.userSearch.open();
  await pages.userSearch.searchUser('octocat');
});