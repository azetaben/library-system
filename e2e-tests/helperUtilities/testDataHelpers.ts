import testDataJson from '../data/testData.json' with {type: 'json'};
import {envConfig} from '../config/env.config.ts';
import {BookFactory} from '../utils/bookFactory.ts';
import {logger} from '../utils/Logger.ts';

export type TestDataShape = typeof testDataJson;

export const createFrameworkTestData = (): TestDataShape => {
    logger.info('Creating framework test data');
    const generatedBook = BookFactory.unique();
    const generatedBook1 = BookFactory.unique();
    const generatedBook2 = BookFactory.unique();
    const createBookData = (book: typeof generatedBook) => {
        const bookPublicationDate = book.publicationDate ?? '2024-01-01';
        const [year, monthNumber, day] = bookPublicationDate.split('-');
        const month = new Date(`${bookPublicationDate}T00:00:00`).toLocaleString(
            'en-US',
            {
                month: 'long',
            },
        );

        return {
            title: book.title,
            author: book.author,
            genre: book.genre,
            ISBN: book.isbn ?? '',
            publicationDate: `${monthNumber}/${day}/${year}`,
            publicationDay: day,
            publicationMonth: month,
            publicationYear: year,
            price: book.price ?? '',
        };
    };

    return {
        ...testDataJson,
        validUser: {
            ...testDataJson.validUser,
            username: envConfig.username,
            password: envConfig.password,
        },
        validBook: {
            ...createBookData(generatedBook),
        },
        validBook1: {
            ...createBookData(generatedBook1),
        },
        validBook2: {
            ...createBookData(generatedBook2),
        },
        invalidBook: {
            ...testDataJson.invalidBook,
            author: generatedBook.author,
            genre: generatedBook.genre,
        },
    };
};
