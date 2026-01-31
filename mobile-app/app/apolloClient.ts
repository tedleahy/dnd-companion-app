import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const API_URL = 'http://192.168.0.106:4000';

type GetTokenFn = () => Promise<string | null>;

export function createApolloClient(getToken: GetTokenFn) {
    const authFetch: typeof fetch = async (uri, options) => {
        const token = await getToken();
        const headers = new Headers(options?.headers || undefined);

        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        return fetch(uri, {
            ...options,
            headers,
        });
    };

    return new ApolloClient({
        link: new HttpLink({ uri: API_URL, fetch: authFetch }),
        cache: new InMemoryCache(),
    });
}
