import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { ActivityIndicator, PaperProvider } from 'react-native-paper';
import { ApolloProvider } from '@apollo/client/react';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { createApolloClient } from './apolloClient';
import { buildFantasyTheme } from '../theme/fantasyTheme';

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const theme = buildFantasyTheme(colorScheme);
    const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

    if (!publishableKey) {
        throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Set it in your Expo env.');
    }

    return (
        <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
            <PaperProvider theme={theme}>
                <AuthGate />
            </PaperProvider>
        </ClerkProvider>
    );
}

function AuthGate() {
    const router = useRouter();
    const segments = useSegments();
    const { isLoaded, isSignedIn, getToken } = useAuth();

    useEffect(() => {
        if (!isLoaded) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!isSignedIn && !inAuthGroup) {
            router.replace('/sign-in');
        } else if (isSignedIn && inAuthGroup) {
            router.replace('/');
        }
    }, [isLoaded, isSignedIn, router, segments]);

    if (!isLoaded) {
        return <ActivityIndicator />;
    }

    const client = createApolloClient(async () => {
        const token = await getToken();
        return token ?? null;
    });

    return (
        <ApolloProvider client={client}>
            <Stack>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="index" />
                <Stack.Screen name="spell/[id]" />
            </Stack>
        </ApolloProvider>
    );
}
