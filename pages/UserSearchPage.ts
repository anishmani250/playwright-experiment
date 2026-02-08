import { expect, type Locator, type Page } from '@playwright/test';
import { UserSearchLocators as L } from '../locators/userSearch.locators';

export class UserSearchPage {
  readonly page: Page;
  readonly searchBar: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // data-testid="search-bar"
    this.searchBar = page.getByTestId(L.searchBarTestId);
    // Search button: getByRole + hasText (instead of CSS nth-child)
    this.searchButton = page.getByRole('button').filter({ hasText: L.searchButtonText });
  }

  async goto(): Promise<void> {
    await this.page.goto('/user');
    await this.assertSearchBarInteractable();
  }

  // Interactable verification required
  async assertSearchBarInteractable(): Promise<void> {
    await expect(this.searchBar, 'Search bar should be visible').toBeVisible();
    await expect(this.searchBar, 'Search bar should be enabled').toBeEnabled();
    await expect(this.searchBar, 'Search bar should be editable').toBeEditable();
  }

  async assertSearchButtonReady(): Promise<void> {
    await expect(this.searchButton, 'Search button should be visible').toBeVisible();
    await expect(this.searchButton, 'Search button should be enabled').toBeEnabled();
  }

  /**
   * Tests call ONLY this method:
   * - Assertions happen inside the page class
   * - Triggers search
   * - Validates backend results
   * - Validates UI renders at least one returned login
   */
  async searchUser(username: string): Promise<void> {
    await this.assertSearchBarInteractable();
    await this.assertSearchButtonReady();

    await this.searchBar.fill(username);

    // Start waiting BEFORE click to avoid race condition
    const responsePromise = this.waitForGitHubUserSearchResponse(username);
    await this.searchButton.click();

    const payload = await responsePromise;

    await this.assertSearchPayloadHasResults(payload, username);
    await this.assertUIShowsAtLeastOneReturnedUser(payload);
  }

  private async waitForGitHubUserSearchResponse(username: string): Promise<any> {
    const response = await this.page.waitForResponse((resp) => {
      if (!resp.url().includes('api.github.com/search/users')) return false;
      if (resp.request().method() !== 'GET') return false;
      if (resp.status() !== 200) return false;

      try {
        const url = new URL(resp.url());
        const q = (url.searchParams.get('q') ?? '').toLowerCase();
        return q.includes(username.toLowerCase());
      } catch {
        return false;
      }
    });

    expect(response.status(), 'Search API should return 200').toBe(200);
    return await response.json();
  }

  private async assertSearchPayloadHasResults(payload: any, username: string): Promise<void> {
    expect(payload, 'Payload should be present').toBeTruthy();
    expect(Array.isArray(payload.items), 'Payload.items should be an array').toBeTruthy();

    expect(
      payload.items.length,
      `Expected at least 1 user result for query: ${username}`
    ).toBeGreaterThan(0);
  }

  /**
   * UI Assertion:
   * Validate that UI renders at least one of the returned logins.
   * Robust fallback strategy:
   *  - checks link accessible name first
   *  - then checks visible text
   */
  private async assertUIShowsAtLeastOneReturnedUser(payload: any): Promise<void> {
    const logins: string[] = (payload.items ?? [])
      .slice(0, 5)
      .map((u: any) => u?.login)
      .filter(Boolean);

    expect(logins.length, 'Should have logins to validate in UI').toBeGreaterThan(0);

    // Prefer link check first
    for (const login of logins) {
      const candidateLink = this.page.getByRole(L.userLinkRole, { name: new RegExp(`^${escapeRegExp(login)}$`, 'i') });
      const visible = await candidateLink.first().isVisible().catch(() => false);
      if (visible) {
        await expect(candidateLink.first(), `Expected login link visible: ${login}`).toBeVisible();
        return;
      }
    }

    // Fallback: visible text
    for (const login of logins) {
      const candidateText = this.page.getByText(new RegExp(`\b${escapeRegExp(login)}\b`, 'i'));
      const visible = await candidateText.first().isVisible().catch(() => false);
      if (visible) {
        await expect(candidateText.first(), `Expected login text visible: ${login}`).toBeVisible();
        return;
      }
    }

    expect(false, `UI did not display any of the top returned users: ${logins.join(', ')}`).toBeTruthy();
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}