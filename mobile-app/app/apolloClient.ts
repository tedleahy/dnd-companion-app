import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
const API_URL = 'http://192.168.0.106:4000';

const apolloClient = new ApolloClient({
    link: new HttpLink({ uri: API_URL }),
    cache: new InMemoryCache(),
});

export default apolloClient;
