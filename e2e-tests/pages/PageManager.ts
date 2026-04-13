import type {Page} from '@playwright/test';
import {LandingPage} from './LandingPage.ts';
import {LoginPage} from './LoginPage.ts';
import {BooksCatalogPage} from './BooksCatalogPage.ts';
import {AddBookPage} from './AddBookPage.ts';
import {EditBookPage} from './EditBookPage.ts';
import {TopNaviPage} from './TopNaviPage.ts';
import {BasePage} from './BasePage.ts';
import {logger} from '../utils/Logger.ts';

export class PageManager {
    private readonly page: Page;
    private basePage: BasePage | null = null;
    private landingPage: LandingPage | null = null;
    private loginPage: LoginPage | null = null;
    private booksCatalogPage: BooksCatalogPage | null = null;
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

    getBooksCatalogPage(): BooksCatalogPage {
        if (!this.booksCatalogPage) {
            logger.debug('Instantiating BooksCatalogPage');
            this.booksCatalogPage = new BooksCatalogPage(this.page);
        }
        return this.booksCatalogPage;
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
}
