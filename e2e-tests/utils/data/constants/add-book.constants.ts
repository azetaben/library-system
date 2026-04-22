export const REQUIRED_ADD_BOOK_ERRORS = [
    {field: 'Title', message: 'Title is required.'},
    {field: 'Author', message: 'Author is required.'},
    {field: 'Genre', message: 'Genre is required.'},
    {field: 'ISBN', message: 'ISBN is required.'},
    {field: 'Publication Date', message: 'Publication Date is required.'},
    {field: 'Price', message: 'Price is required.'},
] as const;
