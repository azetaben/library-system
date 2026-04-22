export interface LoginCredentials extends Record<string, string> {
    username: string;
    password: string;
}

export interface NegativeLoginExample extends LoginCredentials {
    key: string;
    expectedMessage: string;
    description: string;
}
