import type {Page} from '@playwright/test';
import {LandingPage} from './landing-page.ts';
import {LoginPage} from './login-page.ts';
import {BooksPage} from './books-page.ts';
import {AddBookPage} from './add-book-page.ts';
import {EditBookPage} from './edit-book-page.ts';
import {TopNaviPage} from './top-navi-page.ts';
import {BasePage} from './base-page.ts';
import {logger} from '../utils/runtime/index.ts';

export class PageManager {
    private readonly page: Page;
    private basePage: BasePage | null = null;
    private landingPage: LandingPage | null = null;
    private loginPage: LoginPage | null = null;
    private booksPage: BooksPage | null = null;
    private addBookPage: AddBookPage | null = null;
    private editBookPage: EditBookPage | null = null;
    private topNaviPage: TopNaviPage | null = null;

    constructor(page: Page) {
        this.page = page;
    }

    getBasePage(): BasePage {
        if (!this.basePage) {
            logger.debug('Instantiating BasePage');
            this.basePage = new BasePage(this.page);
        }
        return this.basePage;
    }

    getLandingPage(): LandingPage {
        if (!this.landingPage) {
            logger.debug('Instantiating LandingPage');
            this.landingPage = new LandingPage(this.page);
        }
        return this.landingPage;
    }

    getLoginPage(): LoginPage {
        if (!this.loginPage) {
            logger.debug('Instantiating LoginPage');
            this.loginPage = new LoginPage(this.page);
        }
        return this.loginPage;
    }

    getBooksCatalogPage(): BooksPage {
        if (!this.booksPage) {
            logger.debug('Instantiating BooksPage');
            this.booksPage = new BooksPage(this.page);
        }
        return this.booksPage;
    }

    getAddBookPage(): AddBookPage {
        if (!this.addBookPage) {
            logger.debug('Instantiating AddBookPage');
            this.addBookPage = new AddBookPage(this.page);
        }
        return this.addBookPage;
    }

    getEditBookPage(): EditBookPage {
        if (!this.editBookPage) {
            logger.debug('Instantiating EditBookPage');
            this.editBookPage = new EditBookPage(this.page);
        }
        return this.editBookPage;
    }

    getTopNaviPage(): TopNaviPage {
        if (!this.topNaviPage) {
            logger.debug('Instantiating TopNaviPage');
            this.topNaviPage = new TopNaviPage(this.page);
        }
        return this.topNaviPage;
    }

    /**
     * Clears all cached page object instances.
     * Useful when the underlying Playwright Page has been replaced
     * or you need to reset state between steps.
     */
    resetPages(): void {
        logger.debug('Resetting all cached page instances');
        this.basePage = null;
        this.landingPage = null;
        this.loginPage = null;
        this.booksPage = null;
        this.addBookPage = null;
        this.editBookPage = null;
        this.topNaviPage = null;
    }
}
