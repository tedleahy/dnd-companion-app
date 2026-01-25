import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from './apolloClient';
import SpellList from './components/SpellList';

export default function Index() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;

    return (
        <ApolloProvider client={apolloClient}>
            <PaperProvider theme={theme}>
                <SpellList />
            </PaperProvider>
        </ApolloProvider>
    );
}
