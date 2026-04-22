export interface BookInput {
    title: string;
    author: string;
    genre: string;
}

export interface ExtendedBookInput extends BookInput {
    isbn?: string;
    publicationDate?: string;
    price?: string;
}

export interface AddedBookDetails {
    title: string;
    author: string;
    isbn: string;
    genre: string;
    publicationDate: string;
    price: string;
    existingCatalogMatchCount?: number;
}
