import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { UserSearchLocators } from '../locators';

export class UserSearchPage extends BasePage {
  readonly loc: UserSearchLocators;

  constructor(page: Page) {
    super(page);
    this.loc = new UserSearchLocators(page);
  }

  async open(): Promise<void> {
    await this.goto('/user');
    await this.assertSearchBarInteractable();
  }

  // Assertions must be in page class
  async assertSearchBarInteractable(): Promise<void> {
    await expect(this.loc.searchBar, 'Search bar should be visible').toBeVisible();
    await expect(this.loc.searchBar, 'Search bar should be enabled').toBeEnabled();
    await expect(this.loc.searchBar, 'Search bar should be editable').toBeEditable();
  }

  async assertSubmitButtonReady(): Promise<void> {
    await expect(this.loc.submitButton, 'Search button should be visible').toBeVisible();
    await expect(this.loc.submitButton, 'Search button should be enabled').toBeEnabled();
  }

  /**
   * Single public action for tests: performs search and does assertions inside.
   */
  async searchUser(username: string): Promise<void> {
    await this.assertSearchBarInteractable();
    await this.assertSubmitButtonReady();

    // Use BasePage helpers that accept locators
    await this.fill(this.loc.searchBar, username, 'Search bar');

    // Start waiting BEFORE click to avoid race conditions
    const responsePromise = this.waitForGitHubUserSearchResponse(username);
    await this.click(this.loc.submitButton, 'Search button');

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
    expect(payload.items.length, `Expected at least 1 user result for query: ${username}`).toBeGreaterThan(0);
  }

  private async assertUIShowsAtLeastOneReturnedUser(payload: any): Promise<void> {
    const logins: string[] = (payload.items ?? [])
      .slice(0, 5)
      .map((u: any) => u?.login)
      .filter(Boolean);

    expect(logins.length, 'Should have logins to validate in UI').toBeGreaterThan(0);

    // Prefer role=link first
    for (const login of logins) {
      const link = this.page.getByRole('link', { name: new RegExp(`^${escapeRegExp(login)}$`, 'i') });
      const visible = await link.first().isVisible().catch(() => false);
      if (visible) {
        await expect(link.first(), `Expected login link visible: ${login}`).toBeVisible();
        return;
      }
    }

    // Fallback to text
    for (const login of logins) {
      const txt = this.page.getByText(new RegExp(`\b${escapeRegExp(login)}\b`, 'i'));
      const visible = await txt.first().isVisible().catch(() => false);
      if (visible) {
        await expect(txt.first(), `Expected login text visible: ${login}`).toBeVisible();
        return;
      }
    }

    expect(false, `UI did not display any of the top returned users: ${logins.join(', ')}`).toBeTruthy();
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}