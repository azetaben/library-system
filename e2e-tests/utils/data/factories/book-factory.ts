import {faker} from '@faker-js/faker';
import type {ExtendedBookInput} from '../types/book.types.ts';
import type {AddBookData} from '../../../pages/add-book-page.ts';
import {appData} from '../constants/app-data.ts';
import {logger} from '../../runtime/logger.ts';

export class BookFactory {
    static unique(): ExtendedBookInput {
        logger.debug('Generating unique book data');
        const suffix = faker.string.alphanumeric(2).toUpperCase();
        const pastDate = faker.date.past({years: 10});
        const publicationDate = pastDate.toISOString().split('T')[0]; // YYYY-MM-DD
        return {
            title: `Auto ${faker.word.noun()} ${suffix}`,
            author: faker.person.fullName(),
            genre: faker.helpers.arrayElement(appData.catalog.supportedGenres),
            isbn: `978${faker.string.numeric(10)}`,
            publicationDate,
            price: faker.commerce.price({min: 2, max: 3, dec: 2}),
        };
    }


    static uniqueAddBookData(): AddBookData {
        logger.debug('Generating unique add-book form data');
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
