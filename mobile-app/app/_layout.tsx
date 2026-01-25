import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { ApolloProvider } from '@apollo/client/react';
import apolloClient from './apolloClient';
import { buildFantasyTheme } from './theme/fantasyTheme';

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const theme = buildFantasyTheme(colorScheme);

    return (
        <ApolloProvider client={apolloClient}>
            <PaperProvider theme={theme}>
                <Stack />
            </PaperProvider>
        </ApolloProvider>
    );
}
