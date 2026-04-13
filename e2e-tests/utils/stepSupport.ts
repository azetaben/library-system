import {appData} from './AppData.ts';
import {envConfig} from '../config/env.config.ts';

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
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function normalizeNamedPage(pageName: string): NamedPageKey | undefined {
    const normalizedPageName = normalizeValue(pageName);

    for (const [pageKey, aliases] of Object.entries(stepAliases.pages)) {
        if ((aliases as readonly string[]).includes(normalizedPageName)) {
            return pageKey as NamedPageKey;
        }
    }

    return undefined;
}

export function normalizeBookFormName(formName: string): BookFormKey | undefined {
    const normalizedFormName = normalizeValue(formName);

    for (const [formKey, aliases] of Object.entries(stepAliases.forms)) {
        if ((aliases as readonly string[]).includes(normalizedFormName)) {
            return formKey as BookFormKey;
        }
    }

    return undefined;
}

export function routePattern(path: string): RegExp {
    return new RegExp(`${escapeRegex(path)}(?:/|$)`, 'i');
}

export function isLoginTarget(target: string): boolean {
    const normalizedTarget = normalizeValue(target);
    return (
        normalizedTarget === 'login' ||
        normalizedTarget === envConfig.routes.login ||
        normalizedTarget.endsWith(envConfig.routes.login)
    );
}

export function isOnRoute(url: string, route: string): boolean {
    return routePattern(route).test(url);
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
