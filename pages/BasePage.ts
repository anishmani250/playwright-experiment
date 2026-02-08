import { expect, type Locator, type Page } from '@playwright/test';

/**
 * BasePage holds the Playwright Page and provides reusable actions
 * that accept Locators (click, fill, pressSequentially, etc.)
 */
export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async click(target: Locator, label = 'Target'): Promise<void> {
    await expect(target, `${label} should be visible`).toBeVisible();
    await expect(target, `${label} should be enabled`).toBeEnabled();
    await target.click();
  }

  async fill(target: Locator, value: string, label = 'Target'): Promise<void> {
    await expect(target, `${label} should be visible`).toBeVisible();
    await expect(target, `${label} should be editable`).toBeEditable();
    await target.fill(value);
  }

  /**
   * Human-like typing when you need per-keystroke events.
   */
  async pressSequentially(
    target: Locator,
    text: string,
    options?: { delay?: number },
    label = 'Target'
  ): Promise<void> {
    await expect(target, `${label} should be visible`).toBeVisible();
    await expect(target, `${label} should be editable`).toBeEditable();
    await target.focus();
    await target.pressSequentially(text, { delay: options?.delay ?? 0 });
  }
}