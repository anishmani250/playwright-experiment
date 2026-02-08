import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '../pages/BasePage';

/**
 * Locators live here (object repository).
 * This class extends BasePage so it can use this.page.
 */
export class UserSearchLocators extends BasePage {
  readonly searchBar: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);

    // data-testid="search-bar"
    this.searchBar = this.page.getByTestId('search-bar');

    // Required: getByRole with accessible name
    this.submitButton = this.page.getByRole('button', { name: /search/i });
  }
}