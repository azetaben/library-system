module.exports = {
    extends: [
        //'eslint:recommended',
        //'plugin:@typescript-eslint/recommended',
        //'plugin:@typescript-eslint/stylistic',
        'prettier',
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    root: true,
    parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
    },
    rules: {
        'no-restricted-syntax': [
            'error',
            {
                selector: 'TSEnumDeclaration',
                message:
                    'TypeScript enum is not supported in strip-only runtime mode. Use const object + union type instead.',
            },
        ],
    },
};
