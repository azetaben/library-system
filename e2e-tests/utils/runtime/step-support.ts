import {appData} from '../data/constants/app-data.ts';
import {envConfig} from '../../config/env.config.ts';
import {logger} from './logger.ts';
import type {CustomWorld} from '../../support/world.ts';

export type NamedPageKey =
    | 'landing'
    | 'login'
    | 'books'
    | 'addBook'
    | 'editBook';

export type BookFormKey = 'addBook' | 'editBook';

export const stepAliases = {
    pages: {
        landing: ['landing'],
        login: ['login'],
        books: ['book list', 'books', 'books list'],
        addBook: ['add', 'add book', 'add a new book'],
        editBook: ['edit', 'edit book', 'edit book details'],
    },
    forms: {
        addBook: ['add book'],
        editBook: ['edit book'],
    },
} as const;

function normalizeValue(value: string): string {
    return value.trim().toLowerCase();
}

export function escapeRegex(value: string): string {
    logger.debug(`Escaping regex value "${value}"`);
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function normalizeNamedPage(pageName: string): NamedPageKey | undefined {
    const normalizedPageName = normalizeValue(pageName);
    logger.debug(`Normalizing named page "${pageName}"`);

    for (const [pageKey, aliases] of Object.entries(stepAliases.pages)) {
        if ((aliases as readonly string[]).includes(normalizedPageName)) {
            logger.info(`Resolved named page "${pageName}" to "${pageKey}"`);
            return pageKey as NamedPageKey;
        }
    }

    logger.warn(`No named page alias matched "${pageName}"`);
    return undefined;
}

export function normalizeBookFormName(formName: string): BookFormKey | undefined {
    const normalizedFormName = normalizeValue(formName);
    logger.debug(`Normalizing book form name "${formName}"`);

    for (const [formKey, aliases] of Object.entries(stepAliases.forms)) {
        if ((aliases as readonly string[]).includes(normalizedFormName)) {
            logger.info(`Resolved form name "${formName}" to "${formKey}"`);
            return formKey as BookFormKey;
        }
    }

    logger.warn(`No book form alias matched "${formName}"`);
    return undefined;
}

export function routePattern(path: string): RegExp {
    logger.debug(`Creating route pattern for path "${path}"`);
    return new RegExp(`${escapeRegex(path)}(?:/|$)`, 'i');
}

export function isLoginTarget(target: string): boolean {
    const normalizedTarget = normalizeValue(target);
    const result = (
        normalizedTarget === 'login' ||
        normalizedTarget === envConfig.routes.login ||
        normalizedTarget.endsWith(envConfig.routes.login)
    );
    logger.debug(`Login target check for "${target}" resolved to ${result}`);
    return result;
}

export function isOnRoute(url: string, route: string): boolean {
    const result = routePattern(route).test(url);
    logger.debug(`Route match check url="${url}" route="${route}" => ${result}`);
    return result;
}

export const stepUiText = {
    pageHeadings: {
        landing: 'landing',
        login: appData.headings.login,
        books: appData.headings.booksCatalog,
        addBook: appData.headings.addBook,
        editBook: 'Edit book details',
    },
    formNames: {
        addBook: 'Add Book',
    },
} as const;

export async function navigateLandingWhenResponsive(
    world: CustomWorld,
    target: string,
    context?: string,
): Promise<void> {
    const contextMsg = context
        ? context
        : 'Warming the landing page endpoint and navigating when responsive...';
    logger.info(`Action: ${contextMsg}`);
    const landingPage = world.pm.getLandingPage();
    logger.debug(`Responsive navigation target resolved to: ${target}`);
    await world.pm
        .getBasePage()
        .navigateWhenResponsive(target, landingPage.startTestingButton());
}


