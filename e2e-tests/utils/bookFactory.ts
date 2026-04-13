import {faker} from '@faker-js/faker';
import type {BookInput, ExtendedBookInput} from './book.types.ts';
import type {AddBookData} from '../pages/AddBookPage.ts';
import {appData} from './AppData.ts';
import {logger} from './Logger.ts';

export class BookFactory {
    static unique(): ExtendedBookInput {
        logger.info('Generating unique book data');
        const suffix = faker.string.alphanumeric(2).toUpperCase();
        return {
            title: `Auto ${faker.word.noun()} ${suffix}`,
            author: faker.person.fullName(),
            genre: faker.helpers.arrayElement(appData.catalog.supportedGenres),
            isbn: `978${faker.string.numeric(13)}`,
            publicationDate: '2024-01-01',
            price: faker.commerce.price({min: 2, max: 3, dec: 2}),
        };
    }

    static forUi(): BookInput {
        logger.info('Generating UI book data');
        const {title, author, genre} = BookFactory.unique();
        return {title, author, genre};
    }

    static uniqueAddBookData(): AddBookData {
        logger.info('Generating unique add-book form data');
        const seed = Date.now().toString().slice(-8);
        return {
            Title: `QA Book ${seed}`.slice(0, 20),
            Author: 'QA Engineer',
            Genre: 'Fantasy',
            ISBN: `97812${seed}`.padEnd(13, '0').slice(0, 13),
            'Publication Date': '2024-01-15',
            Price: '19.99',
        };
    }
}
