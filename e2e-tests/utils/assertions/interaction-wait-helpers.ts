import type {Locator, Page} from '@playwright/test';
import {expect} from '@playwright/test';
import {envConfig} from '../../config/env.config.ts';
import {logger} from '../runtime/logger.ts';

/**
 * Unified wait strategy helper for element and page readiness.
 * Consolidates WaitUtil and WaitHelpers into single source of truth.
 *
 * All methods accept optional timeout; defaults to envConfig values.
 *
 * Usage patterns:
 * - waitUntilClickable(button) before clicking
 * - waitUntilFillable(input) before filling text
 * - waitUntilVisible(element) before assertions
 * - waitForPageReady(page) after navigation
 */
export class InteractionWaitHelpers {
  private static readonly DEFAULT_TIMEOUT = envConfig.defaultTimeoutMs;
  private static readonly NAVIGATION_TIMEOUT = envConfig.navigationTimeoutMs;

  // =============================================================================
  // PAGE STATE WAITS (for navigation and load detection)
  // =============================================================================

  /**
   * Wait for page DOM to be fully loaded.
   * Use after navigation to wait for domcontentloaded event.
   */
  static async waitForPageReady(
    page: Page,
    timeout: number = this.NAVIGATION_TIMEOUT,
  ): Promise<void> {
    logger.info(`Waiting for page DOM content load within ${timeout}ms`);
    await page.waitForLoadState('domcontentloaded', {timeout});
  }

  /**
   * Wait for network idle (no pending requests).
   * More comprehensive than domcontentloaded; slower but catches async data loads.
   */
  static async waitForNetworkIdle(
    page: Page,
    timeout: number = this.NAVIGATION_TIMEOUT,
  ): Promise<void> {
    logger.info(`Waiting for network idle within ${timeout}ms`);
    await page.waitForLoadState('networkidle', {timeout});
  }

  /**
   * Explicit sleep for fixed duration (last resort; prefer explicit waits).
   * @deprecated Use explicit waits instead (waitUntilVisible, waitUntilClickable, etc.)
   */
  static async sleepMs(page: Page, ms: number): Promise<void> {
    logger.warn(`[DEPRECATED] Explicit sleep for ${ms}ms; prefer explicit waits`);
    await page.waitForTimeout(ms);
  }

  // =============================================================================
  // ELEMENT VISIBILITY WAITS (for visibility state)
  // =============================================================================

  /**
   * Wait until element is visible in the viewport.
   * Does NOT check if element is ready for interaction.
   */
  static async waitUntilVisible(
    locator: Locator | null | undefined,
    timeout: number = this.DEFAULT_TIMEOUT,
  ): Promise<void> {
    this.ensureLocator(locator, 'waitUntilVisible');
    logger.info(`Waiting for element to be visible within ${timeout}ms`);
    await locator!.waitFor({state: 'visible', timeout});
  }

  /**
   * Wait until element is hidden or removed from DOM.
   * Useful for waiting for loading spinners or modals to disappear.
   */
  static async waitUntilHidden(
    locator: Locator | null | undefined,
    timeout: number = this.DEFAULT_TIMEOUT,
  ): Promise<void> {
    this.ensureLocator(locator, 'waitUntilHidden');
    logger.info(`Waiting for element to be hidden within ${timeout}ms`);
    await locator!.waitFor({state: 'hidden', timeout});
  }

  /**
   * Wait until element is in DOM (attached), regardless of visibility.
   * Lower-level check; prefer waitUntilVisible for most cases.
   */
  static async waitUntilAttached(
    locator: Locator | null | undefined,
    timeout: number = this.DEFAULT_TIMEOUT,
  ): Promise<void> {
    this.ensureLocator(locator, 'waitUntilAttached');
    logger.info(`Waiting for element to be attached to DOM within ${timeout}ms`);
    await locator!.waitFor({state: 'attached', timeout});
  }

  /**
   * Wait until element is detached from DOM.
   */
  static async waitUntilDetached(
    locator: Locator | null | undefined,
    timeout: number = this.DEFAULT_TIMEOUT,
  ): Promise<void> {
    this.ensureLocator(locator, 'waitUntilDetached');
    logger.info(`Waiting for element to be detached from DOM within ${timeout}ms`);
    await locator!.waitFor({state: 'detached', timeout});
  }

  // =============================================================================
  // ELEMENT INTERACTION READINESS (compound waits before user actions)
  // =============================================================================

  /**
   * Wait until element is ready to click.
   * Verifies: visible + stable position + enabled + receives events.
   * Use before all click() operations.
   */
  static async waitUntilClickable(
    locator: Locator | null | undefined,
    timeout: number = this.DEFAULT_TIMEOUT,
  ): Promise<void> {
    this.ensureLocator(locator, 'waitUntilClickable');
    logger.info(`Waiting for element to be clickable within ${timeout}ms`);
    await this.waitUntilVisible(locator, timeout);
    await this.waitUntilStable(locator, timeout);
    await this.waitUntilEnabled(locator, timeout);
    await this.waitUntilReceivesEvents(locator, timeout);
  }

  /**
   * Wait until element is ready for text input.
   * Verifies: visible + enabled + editable + stable position.
   * Use before all fill() and type() operations.
   */
  static async waitUntilFillable(
    locator: Locator | null | undefined,
    timeout: number = this.DEFAULT_TIMEOUT,
  ): Promise<void> {
    this.ensureLocator(locator, 'waitUntilFillable');
    logger.info(`Waiting for element to be fillable within ${timeout}ms`);
    await this.waitUntilVisible(locator, timeout);
    await this.waitUntilEnabled(locator, timeout);
    await this.waitUntilEditable(locator, timeout);
  }

  /**
   * Wait until element is ready for hover interaction.
   * Verifies: visible + stable position + receives events.
   */
  static async waitUntilHoverable(
    locator: Locator | null | undefined,
    timeout: number = this.DEFAULT_TIMEOUT,
  ): Promise<void> {
    this.ensureLocator(locator, 'waitUntilHoverable');
    logger.info(`Waiting for element to be hoverable within ${timeout}ms`);
    await this.waitUntilVisible(locator, timeout);
    await this.waitUntilStable(locator, timeout);
    await this.waitUntilReceivesEvents(locator, timeout);
  }

  /**
   * Wait until dropdown/select is ready for option selection.
   * Verifies: visible + enabled + stable.
   */
  static async waitUntilSelectable(
    locator: Locator | null | undefined,
    timeout: number = this.DEFAULT_TIMEOUT,
  ): Promise<void> {
    this.ensureLocator(locator, 'waitUntilSelectable');
    logger.info(`Waiting for element to be selectable within ${timeout}ms`);
    await this.waitUntilVisible(locator, timeout);
    await this.waitUntilEnabled(locator, timeout);
    await this.waitUntilStable(locator, timeout);
  }

  /**
   * Wait until element is ready for screenshot (visible + stable).
   * Use before taking comparison/baseline screenshots.
   */
  static async waitUntilScreenshotReady(
    locator: Locator | null | undefined,
    timeout: number = this.DEFAULT_TIMEOUT,
  ): Promise<void> {
    this.ensureLocator(locator, 'waitUntilScreenshotReady');
    logger.info(`Waiting for element to be screenshot ready within ${timeout}ms`);
    await this.waitUntilVisible(locator, timeout);
    await this.waitUntilStable(locator, timeout);
  }

  // =============================================================================
  // ELEMENT STATE CHECKS (lower-level, used internally and externally)
  // =============================================================================

  /**
   * Wait until element is enabled (not disabled).
   * Checks both disabled attribute and aria-disabled.
   */
  static async waitUntilEnabled(
    locator: Locator | null | undefined,
    timeout: number = this.DEFAULT_TIMEOUT,
  ): Promise<void> {
    this.ensureLocator(locator, 'waitUntilEnabled');
    logger.info(`Waiting for element to be enabled within ${timeout}ms`);
    await this.waitUntilAttached(locator, timeout);
    await expect(locator!).toBeEnabled({timeout});
  }

  /**
   * Wait until element is editable (can accept text input).
   * Checks readOnly attribute and input type restrictions.
   */
  static async waitUntilEditable(
    locator: Locator | null | undefined,
    timeout: number = this.DEFAULT_TIMEOUT,
  ): Promise<void> {
    this.ensureLocator(locator, 'waitUntilEditable');
    logger.info(`Waiting for element to be editable within ${timeout}ms`);
    await expect(locator!).toBeEditable({timeout});
  }

  /**
   * Wait until element is in stable position (not animating/scrolling).
   * Checks bounding box stays constant over multiple checks.
   */
  static async waitUntilStable(
    locator: Locator | null | undefined,
    timeout: number = this.DEFAULT_TIMEOUT,
  ): Promise<void> {
    this.ensureLocator(locator, 'waitUntilStable');
    logger.info(`Waiting for element to be in stable position within ${timeout}ms`);

    const startTime = Date.now();
    let previousBox = await locator!.boundingBox();

    while (Date.now() - startTime < timeout) {
      await locator!.page().waitForTimeout(100);
      const currentBox = await locator!.boundingBox();

      if (previousBox && currentBox && this.boundingBoxesEqual(previousBox, currentBox)) {
        return;
      }

      previousBox = currentBox;
    }

    throw new Error(
      `[InteractionWaitHelpers.waitUntilStable] Element did not stabilize within ${timeout}ms`,
    );
  }

  /**
   * Wait until element can receive browser events (is in viewport/hittable).
   * Verifies element is not covered by other elements.
   */
  static async waitUntilReceivesEvents(
    locator: Locator | null | undefined,
    timeout: number = this.DEFAULT_TIMEOUT,
  ): Promise<void> {
    this.ensureLocator(locator, 'waitUntilReceivesEvents');
    logger.info(`Waiting for element to receive events within ${timeout}ms`);

    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const isHittable = await locator!.evaluate((element) => {
        const rect = (element as HTMLElement).getBoundingClientRect();
        const hitElement = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        return element === hitElement || (element as HTMLElement).contains(hitElement as HTMLElement);
      }).catch(() => false);

      if (isHittable) return;
      await locator!.page().waitForTimeout(50);
    }

    throw new Error(
      `[InteractionWaitHelpers.waitUntilReceivesEvents] Element did not become hittable within ${timeout}ms`,
    );
  }

  // =============================================================================
  // PRIVATE HELPERS
  // =============================================================================

  private static boundingBoxesEqual(box1: any, box2: any): boolean {
    return (
      Math.abs(box1.x - box2.x) < 1 &&
      Math.abs(box1.y - box2.y) < 1 &&
      Math.abs(box1.width - box2.width) < 1 &&
      Math.abs(box1.height - box2.height) < 1
    );
  }

  private static ensureLocator(
    locator: Locator | null | undefined,
    methodName: string,
  ): asserts locator is Locator {
    if (!locator) {
      throw new Error(`[InteractionWaitHelpers.${methodName}] Locator is null or undefined`);
    }
  }
}

