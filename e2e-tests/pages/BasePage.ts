import type {Locator, Page} from '@playwright/test';
import {envConfig} from '../config/env.config.ts';
import {WaitHelpers} from '../helperUtilities/waitHelpers.ts';
import {logger} from '../utils/Logger.ts';

const responsiveWarmupCache = new Map<string, number>();

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
        await this.page.goto(targetUrl);
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
        const targetUrl = this.buildUrl(url);
        const {
            warmupTimeoutMs = envConfig.responsiveWarmupTimeoutMs,
            fastResponseThresholdMs = 2_000,
            consecutiveFastResponses = 1,
            pollIntervalMs = envConfig.responsivePollIntervalMs,
            requestTimeoutMs = envConfig.responsiveRequestTimeoutMs,
            cacheTtlMs = envConfig.responsiveCacheTtlMs,
            warmupUrl,
        } = options ?? {};
        const warmupTargetUrl = this.resolveWarmupTargetUrl(warmupUrl);

        if (this.isWarmupCacheFresh(warmupTargetUrl, cacheTtlMs)) {
            logger.info(`Skipping warmup for ${warmupTargetUrl}; recent successful probe is still fresh.`);
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
                    logger.info(
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
    }

    async clickElement(locator: Locator) {
        logger.info('Clicking page element');
        await WaitHelpers.clickable(locator);
        await locator.click();
    }

    async waitAndClick(locator: Locator) {
        await this.clickElement(locator);
    }

    async fillInput(locator: Locator, text: string) {
        logger.info(`Filling page input with value: ${text || '<blank>'}`);
        await WaitHelpers.fillable(locator);
        await locator.fill(text);
    }

    async fill(locator: Locator, text: string) {
        await this.fillInput(locator, text);
    }

    async getInnerText(locator: Locator): Promise<string> {
        logger.info('Reading element innerText');
        await WaitHelpers.visible(locator);
        return await locator.innerText();
    }

    async getTextContent(locator: Locator): Promise<string | null> {
        logger.info('Reading element textContent');
        await WaitHelpers.visible(locator);
        return await locator.textContent();
    }

    async getAllTextContent(locator: Locator): Promise<Array<string>> {
        logger.info('Reading all element text contents');
        await WaitHelpers.visible(locator);
        return await locator.allTextContents();
    }

    async delay(ms: number) {
        logger.info(`Waiting for ${ms}ms`);
        await this.page.waitForTimeout(ms);
    }

    getBodyLocator() {
        return this.page.locator('body');
    }

    private resolveWarmupTargetUrl(explicitWarmupUrl?: string): string {
        if (explicitWarmupUrl) {
            return this.buildUrl(explicitWarmupUrl);
        }

        return `${envConfig.baseUrl}/`;
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
        const headProbe = await this.fetchWithTimeout(probeUrl, 'HEAD', requestTimeoutMs);
        if (headProbe.statusCode === 405 || headProbe.statusCode === 501) {
            return await this.fetchWithTimeout(probeUrl, 'GET', requestTimeoutMs);
        }

        return headProbe;
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
            const status =
                error?.name === 'AbortError'
                    ? `timeout after ${requestTimeoutMs}ms`
                    : error?.message ?? 'request failed';

            throw new Error(`${method} ${probeUrl} failed: ${status}`);
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
            await WaitHelpers.visible(readyLocator, envConfig.defaultTimeoutMs);
        }
    }
}
