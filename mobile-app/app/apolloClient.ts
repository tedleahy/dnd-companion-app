import { supabase } from '@/lib/supabase';
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';

const httpLink = new HttpLink({ uri: process.env.EXPO_PUBLIC_API_URL });

// A link that runs on all requests, adding a JWT authorisation token for supabase
const authLink = new SetContextLink(async (prevContext, _) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    return {
        headers: {
            ...prevContext.headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    };
});

const apolloClient = new ApolloClient({
    link: ApolloLink.from([authLink, httpLink]),
    cache: new InMemoryCache(),
});

export default apolloClient;
