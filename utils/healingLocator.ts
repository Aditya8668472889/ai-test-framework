import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { suggestSelector } from './selfHeal';

// File where every healing suggestion is appended for the developer to review.
const HEALING_LOG = path.join(__dirname, 'healing-log.json');

// Fail the first attempt fast (instead of waiting the full action timeout) so a
// broken selector hands off to healing quickly. The retry uses the normal timeout.
const FIRST_ATTEMPT_TIMEOUT = 5000;

// Only heal when the failure is a locator resolution problem — i.e. Playwright
// waited and timed out because the selector never matched an actionable element.
// Anything else (assertion failures, navigation errors, bad selector syntax) is
// a real bug we must NOT mask by swapping selectors, so it's re-thrown.
function isLocatorError(error: unknown): boolean {
  return error instanceof Error && error.name === 'TimeoutError';
}

// Wraps a single selector so any action self-heals: try normally, and on
// failure ask Claude for a fresh selector, then retry with it.
export class HealingLocator {
  constructor(
    private page: Page,
    private selector: string,
    private name: string // human readable name for logging
  ) {}

  async click() {
    try {
      await this.page.locator(this.selector).click({ timeout: FIRST_ATTEMPT_TIMEOUT });
    } catch (error) {
      if (!isLocatorError(error)) throw error;
      const healed = await this.heal();
      await this.page.locator(healed).click();
    }
  }

  async fill(value: string) {
    try {
      await this.page.locator(this.selector).fill(value, { timeout: FIRST_ATTEMPT_TIMEOUT });
    } catch (error) {
      if (!isLocatorError(error)) throw error;
      const healed = await this.heal();
      await this.page.locator(healed).fill(value);
    }
  }

  async isVisible(): Promise<boolean> {
    try {
      return await this.page.locator(this.selector).isVisible({ timeout: FIRST_ATTEMPT_TIMEOUT });
    } catch (error) {
      if (!isLocatorError(error)) throw error;
      const healed = await this.heal();
      return await this.page.locator(healed).isVisible();
    }
  }

  // Capture the live DOM, ask Claude for a replacement selector, log it,
  // persist it to healing-log.json, and update this.selector for retries.
  private async heal(): Promise<string> {
    const html = await this.page.content();
    const oldSelector = this.selector;
    const newSelector = await suggestSelector(oldSelector, html);

    console.log(`🔧 Healed [${this.name}]: ${oldSelector} → ${newSelector}`);

    const entry = {
      timestamp: new Date().toISOString(),
      name: this.name,
      oldSelector,
      newSelector,
      url: this.page.url(),
    };

    // Append to the JSON array, tolerating a missing or empty log file.
    let log: any[] = [];
    try {
      log = JSON.parse(fs.readFileSync(HEALING_LOG, 'utf-8'));
    } catch {
      log = [];
    }
    log.push(entry);
    fs.writeFileSync(HEALING_LOG, JSON.stringify(log, null, 2));

    this.selector = newSelector;
    return newSelector;
  }
}
