import { test, expect } from '../fixtures/pagesFixture';

// Change this username as needed
const username = 'ThaELL1';

test('User search UI + GitHub API checks @pages', async ({ pages, request }, testInfo) => {
  // --- API checks (NO token / NO auth) ---
  const headers = {
    Accept: 'application/vnd.github+json',
  };

  // User
  const userRes = await request.get(`https://api.github.com/users/${username}`, { headers });
  expect(userRes.status(), 'User API status should be 200').toBe(200);
  const userJson = await userRes.json();
  expect(String(userJson?.login ?? '').toLowerCase(), 'User login should match').toBe(username.toLowerCase());

  // Repos
  const reposRes = await request.get(`https://api.github.com/users/${username}/repos`, { headers });
  expect(reposRes.status(), 'Repos API status should be 200').toBe(200);
  const reposJson = await reposRes.json();
  expect(Array.isArray(reposJson), 'Repos response should be an array').toBeTruthy();

  // Followers
  const followersRes = await request.get(`https://api.github.com/users/${username}/followers`, { headers });
  expect(followersRes.status(), 'Followers API status should be 200').toBe(200);
  const followersJson = await followersRes.json();

  // If empty array as response put message "nofollowers"
  if (Array.isArray(followersJson) && followersJson.length === 0) {
    console.warn('nofollowers');
    testInfo.annotations.push({ type: 'nofollowers', description: `User ${username} has no followers` });
  }

  // --- UI flow ---
  await pages.userSearch.open();
  await pages.userSearch.searchUser(username);
});
