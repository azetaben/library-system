import type {Locator, Page} from '@playwright/test';
import {envConfig} from '../config/env.config.ts';
import {logger} from '../utils/runtime/index.ts';
import {retryNavigation} from '../utils/resilience/index.ts';
import {getGlobalWarmupBreaker} from '../utils/resilience/index.ts';

const responsiveWarmupCache = new Map<string, number>();
const preferredWarmupProbeMethod = new Map<string, 'HEAD' | 'GET'>();

export class BasePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    buildUrl(path = ''): string {
        if (/^https?:\/\//i.test(path)) {
            return path;
        }

        if (!path || path === '/') {
            return envConfig.baseUrl;
        }

        return `${envConfig.baseUrl}/${path.replace(/^\/+/, '')}`;
    }

    async navigateTo(url: string) {
        const targetUrl = this.buildUrl(url);
        logger.info(`Navigating to ${targetUrl}`);
        await retryNavigation(() => this.page.goto(targetUrl));
    }

    async navigateWhenResponsive(
        url: string,
        readyLocator?: Locator,
        options?: {
            warmupTimeoutMs?: number;
            fastResponseThresholdMs?: number;
            consecutiveFastResponses?: number;
            pollIntervalMs?: number;
            requestTimeoutMs?: number;
            cacheTtlMs?: number;
            warmupUrl?: string;
        },
    ): Promise<void> {
        const breaker = getGlobalWarmupBreaker();
        const targetUrl = this.buildUrl(url);

        try {
            await breaker.execute(
                async () => {
                    const isEntryTarget = this.isEntryTarget(url, targetUrl);
                    const profileDefaults = isEntryTarget
                        ? this.getEntryWarmupDefaults()
                        : this.getDefaultWarmupDefaults();
                    const {
                        warmupTimeoutMs = profileDefaults.warmupTimeoutMs,
                        fastResponseThresholdMs = profileDefaults.fastResponseThresholdMs,
                        consecutiveFastResponses = profileDefaults.consecutiveFastResponses,
                        pollIntervalMs = profileDefaults.pollIntervalMs,
                        requestTimeoutMs = profileDefaults.requestTimeoutMs,
                        cacheTtlMs = profileDefaults.cacheTtlMs,
                        warmupUrl,
                    } = options ?? {};
                    const warmupTargetUrl = this.resolveWarmupTargetUrl(warmupUrl);

                    if (this.isWarmupCacheFresh(warmupTargetUrl, cacheTtlMs)) {
                        logger.debug(`Skipping warmup for ${warmupTargetUrl}; recent successful probe is still fresh.`);
                        await this.gotoResponsiveTarget(targetUrl, readyLocator);
                        return;
                    }

                    const deadline = Date.now() + warmupTimeoutMs;
                    let fastResponses = 0;
                    let lastStatus = 'no response';
                    let lastDurationMs = 0;
                    let attempt = 0;

                    logger.info(`Warming endpoint ${warmupTargetUrl} until it becomes responsive.`);

                    while (Date.now() < deadline) {
                        attempt += 1;

                        try {
                            const probe = await this.probeResponsiveUrl(
                                warmupTargetUrl,
                                requestTimeoutMs,
                            );
                            lastDurationMs = probe.durationMs;
                            lastStatus = probe.status;

                            if (
                                probe.isResponsive &&
                                lastDurationMs <= fastResponseThresholdMs
                            ) {
                                fastResponses += 1;
                                logger.debug(
                                    `Warmup response ${fastResponses}/${consecutiveFastResponses} in ${lastDurationMs}ms (${lastStatus}).`,
                                );
                            } else {
                                fastResponses = 0;
                                logger.warn(
                                    `Warmup response was too slow or unhealthy: ${lastStatus} in ${lastDurationMs}ms.`,
                                );
                            }

                            if (fastResponses >= consecutiveFastResponses) {
                                this.markWarmupCache(warmupTargetUrl);
                                break;
                            }
                        } catch (error: any) {
                            fastResponses = 0;
                            if (typeof error?.durationMs === 'number' && Number.isFinite(error.durationMs)) {
                                lastDurationMs = error.durationMs;
                            }
                            lastStatus = error?.message ?? 'request failed';
                            logger.warn(
                                `Warmup request failed after ${lastDurationMs}ms: ${lastStatus}`,
                            );
                        }

                        const delayMs = Math.min(
                            pollIntervalMs,
                            250 * 2 ** Math.min(attempt - 1, 3),
                        );
                        await this.page.waitForTimeout(delayMs);
                    }

                    if (fastResponses < consecutiveFastResponses) {
                        throw new Error(
                            `URL did not become responsive within ${warmupTimeoutMs}ms. ` +
                            `Last status: ${lastStatus}. Last duration: ${lastDurationMs}ms.`,
                        );
                    }

                    await this.gotoResponsiveTarget(targetUrl, readyLocator);
                },
                `navigate:${url}`
            );
        } catch (error) {
            logger.error(`Navigation failed for ${url}: ${error}`);
            throw error;
        }
    }

    async clickElement(locator: Locator) {
        logger.debug('Clicking page element');
        await locator.click();
    }

    async waitAndClick(locator: Locator) {
        await this.clickElement(locator);
    }

    async fillInput(locator: Locator, text: string) {
        logger.debug(`Filling page input with value: ${text || '<blank>'}`);
        await locator.fill(text);
    }

    async fill(locator: Locator, text: string) {
        await this.fillInput(locator, text);
    }

    async getInnerText(locator: Locator): Promise<string> {
        logger.debug('Reading element innerText');
        return await locator.innerText();
    }

    async getTextContent(locator: Locator): Promise<string | null> {
        logger.debug('Reading element textContent');
        return await locator.textContent();
    }

    async getAllTextContent(locator: Locator): Promise<Array<string>> {
        logger.debug('Reading all element text contents');
        return await locator.allTextContents();
    }

    async delay(ms: number) {
        logger.debug(`Waiting for ${ms}ms`);
        await this.page.waitForTimeout(ms);
    }

    getBodyLocator() {
        return this.page.locator('body');
    }

    getControlsLocator(): Locator {
        return this.page.locator('button, a, [role="button"]');
    }

    getCompactControlLocator(label: string): Locator {
        return this.page
            .locator(
                `button:has-text("${label}"), a:has-text("${label}"), [role="button"]:has-text("${label}")`,
            )
            .first();
    }

    getControlByExactLabel(label: string, overridePattern?: RegExp): Locator {
        const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const labelPattern = overridePattern ?? new RegExp(`^\\s*${escapedLabel}\\s*$`, 'i');
        return this.getControlsLocator().filter({hasText: labelPattern}).first();
    }

    getControlsByPattern(pattern: RegExp): Locator {
        return this.getControlsLocator().filter({hasText: pattern});
    }

    getHeadingsLocator(): Locator {
        return this.page.locator('h1, h2, h3, [role="heading"]');
    }

    getHeadingByPattern(pattern: RegExp): Locator {
        return this.getHeadingsLocator().filter({hasText: pattern}).first();
    }

    getHeadingOrTextLocator(): Locator {
        return this.page.locator('h1, h2, h3, [role="heading"], p, div, span');
    }

    getHeadingOrTextByPattern(pattern: RegExp): Locator {
        return this.getHeadingOrTextLocator().filter({hasText: pattern});
    }

    getHeadingTextAndControlsByPattern(pattern: RegExp): Locator {
        return this.page
            .locator('h1, h2, h3, p, div, span, a, button, [role="button"]')
            .filter({hasText: pattern});
    }

    getFormOrHeadingByPattern(pattern: RegExp): Locator {
        return this.page
            .locator('h1, h2, h3, [role="heading"], form, section, div')
            .filter({hasText: pattern})
            .first();
    }

    getButtonByText(label: string): Locator {
        return this.page.locator(`button:has-text("${label}")`);
    }

    getAnchorWithHrefLocator(): Locator {
        return this.page.locator('a[href]');
    }

    async getBodyText(): Promise<string> {
        return (await this.getBodyLocator().textContent().catch(() => '')) ?? '';
    }

    private resolveWarmupTargetUrl(explicitWarmupUrl?: string): string {
        if (explicitWarmupUrl) {
            return this.normalizeWarmupCacheKey(this.buildUrl(explicitWarmupUrl));
        }

        return this.normalizeWarmupCacheKey(this.buildUrl('/'));
    }

    private normalizeWarmupCacheKey(url: string): string {
        return url.replace(/\/+$/, '');
    }

    private isEntryTarget(url: string, targetUrl: string): boolean {
        if (!url || url === '/') {
            return true;
        }

        const normalizedTarget = this.normalizeWarmupCacheKey(targetUrl);
        const normalizedBaseUrl = this.normalizeWarmupCacheKey(envConfig.baseUrl);
        return normalizedTarget === normalizedBaseUrl;
    }

    private getDefaultWarmupDefaults() {
        return {
            warmupTimeoutMs: envConfig.responsiveWarmupTimeoutMs,
            fastResponseThresholdMs: envConfig.responsiveFastResponseThresholdMs,
            consecutiveFastResponses: envConfig.responsiveConsecutiveFastResponses,
            pollIntervalMs: envConfig.responsivePollIntervalMs,
            requestTimeoutMs: envConfig.responsiveRequestTimeoutMs,
            cacheTtlMs: envConfig.responsiveCacheTtlMs,
        };
    }

    private getEntryWarmupDefaults() {
        return {
            warmupTimeoutMs: envConfig.entryResponsiveWarmupTimeoutMs,
            fastResponseThresholdMs: envConfig.entryResponsiveFastResponseThresholdMs,
            consecutiveFastResponses: envConfig.entryResponsiveConsecutiveFastResponses,
            pollIntervalMs: envConfig.entryResponsivePollIntervalMs,
            requestTimeoutMs: envConfig.entryResponsiveRequestTimeoutMs,
            cacheTtlMs: envConfig.entryResponsiveCacheTtlMs,
        };
    }

    private isWarmupCacheFresh(warmupTargetUrl: string, cacheTtlMs: number): boolean {
        const lastResponsiveAt = responsiveWarmupCache.get(warmupTargetUrl);
        if (!lastResponsiveAt) {
            return false;
        }

        return Date.now() - lastResponsiveAt <= cacheTtlMs;
    }

    private markWarmupCache(warmupTargetUrl: string): void {
        responsiveWarmupCache.set(warmupTargetUrl, Date.now());
    }

    private async probeResponsiveUrl(
        probeUrl: string,
        requestTimeoutMs: number,
    ): Promise<{isResponsive: boolean; status: string; durationMs: number}> {
        const preferredMethod = preferredWarmupProbeMethod.get(probeUrl);
        if (preferredMethod === 'GET') {
            return await this.fetchWithTimeout(probeUrl, 'GET', requestTimeoutMs);
        }

        let headErrorMessage: string | undefined;

        try {
            const headProbe = await this.fetchWithTimeout(probeUrl, 'HEAD', requestTimeoutMs);
            if (headProbe.statusCode === 405 || headProbe.statusCode === 501) {
                preferredWarmupProbeMethod.set(probeUrl, 'GET');
                return await this.fetchWithTimeout(probeUrl, 'GET', requestTimeoutMs);
            }

            return headProbe;
        } catch (error: any) {
            headErrorMessage = error?.message ?? 'HEAD probe failed';
            logger.debug(
                `HEAD warmup probe failed for ${probeUrl}; retrying with GET. Reason: ${headErrorMessage}`,
            );
        }

        try {
            const getProbe = await this.fetchWithTimeout(probeUrl, 'GET', requestTimeoutMs);
            preferredWarmupProbeMethod.set(probeUrl, 'GET');
            return getProbe;
        } catch (error: any) {
            const getErrorMessage = error?.message ?? 'GET probe failed';
            throw new Error(
                `Warmup probe failed for ${probeUrl}. HEAD error: ${headErrorMessage}. GET error: ${getErrorMessage}`,
            );
        }
    }

    private async fetchWithTimeout(
        probeUrl: string,
        method: 'HEAD' | 'GET',
        requestTimeoutMs: number,
    ): Promise<{isResponsive: boolean; status: string; statusCode: number; durationMs: number}> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);
        const startedAt = Date.now();

        try {
            const response = await fetch(probeUrl, {
                method,
                redirect: 'follow',
                signal: controller.signal,
                headers: {
                    'cache-control': 'no-cache',
                },
            });
            const durationMs = Date.now() - startedAt;

            return {
                isResponsive: response.status < 500,
                status: `${response.status} ${response.statusText}`,
                statusCode: response.status,
                durationMs,
            };
        } catch (error: any) {
            const durationMs = Date.now() - startedAt;
            const status =
                error?.name === 'AbortError'
                    ? `timeout after ${requestTimeoutMs}ms`
                    : error?.message ?? 'request failed';

            const wrappedError = new Error(`${method} ${probeUrl} failed after ${durationMs}ms: ${status}`);
            (wrappedError as Error & {durationMs?: number}).durationMs = durationMs;
            throw wrappedError;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    private async gotoResponsiveTarget(
        targetUrl: string,
        readyLocator?: Locator,
    ): Promise<void> {
        await this.page.goto(targetUrl, {
            waitUntil: readyLocator ? 'commit' : 'domcontentloaded',
            timeout: envConfig.navigationTimeoutMs,
        });

        if (readyLocator) {
            await readyLocator.waitFor({
                state: 'visible',
                timeout: envConfig.navigationTimeoutMs,
            });

        }
    }
}
