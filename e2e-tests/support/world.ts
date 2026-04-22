import type {IWorldOptions} from '@cucumber/cucumber';
import {setWorldConstructor, World} from '@cucumber/cucumber';
import type {Browser, BrowserContext, Page} from '@playwright/test';
import {PageManager} from '../pages/page-manager.ts';
import type {AddBookData} from '../pages/add-book-page.ts';
import type {AddedBookDetails} from '../utils/data/index.ts';
import {logger} from '../utils/runtime/index.ts';

export class CustomWorld extends World {
    browser!: Browser;
    context!: BrowserContext;
    page!: Page;
    pm!: PageManager;
    createdBook?: AddBookData;
    addedBookDetails?: AddedBookDetails;
    updatedBookDetails?: AddedBookDetails;
    lastCreatedBookTitle?: string;
    activeBookFormName?: string;
    submittedFormData?: Record<string, string>;
    existingCatalogMatchCount?: number;
    activeNegativeLoginExample?: string;
    securityDialogMessages?: string[];

    constructor(options: IWorldOptions) {
        super(options);
        logger.debug('CustomWorld initialized');
    }
}

setWorldConstructor(CustomWorld);
