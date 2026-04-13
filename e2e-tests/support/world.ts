import type {IWorldOptions} from '@cucumber/cucumber';
import {setWorldConstructor, World} from '@cucumber/cucumber';
import type {Browser, BrowserContext, Page} from '@playwright/test';
import {PageManager} from '../pages/PageManager.ts';
import type {AddBookData} from '../pages/AddBookPage.ts';
import {logger} from '../utils/Logger.ts';

export class CustomWorld extends World {
    browser!: Browser;
    context!: BrowserContext;
    page!: Page;
    pm!: PageManager;
    createdBook?: AddBookData;
    lastCreatedBookTitle?: string;


    constructor(options: IWorldOptions) {
        super(options);
        logger.debug('CustomWorld initialized');
    }
}

setWorldConstructor(CustomWorld);
