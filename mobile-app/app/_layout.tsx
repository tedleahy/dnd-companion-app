import { Stack } from 'expo-router';
import { StyleSheet, useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { ApolloProvider } from '@apollo/client/react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import apolloClient from './apolloClient';
import { buildFantasyTheme, fantasyTokens } from '../theme/fantasyTheme';

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const theme = buildFantasyTheme(colorScheme);

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea}>
                <ApolloProvider client={apolloClient}>
                    <PaperProvider theme={theme}>
                        <Stack
                            screenOptions={{
                                headerShown: false,
                                contentStyle: { backgroundColor: fantasyTokens.colors.night },
                                animation: 'fade_from_bottom',
                                animationDuration: fantasyTokens.motion.standard,
                            }}
                        >
                            <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
                            <Stack.Screen
                                name="spells/[id]"
                                options={{ animation: 'slide_from_right', animationDuration: fantasyTokens.motion.standard }}
                            />
                            <Stack.Screen
                                name="spell-lists/[id]"
                                options={{ animation: 'slide_from_right', animationDuration: fantasyTokens.motion.standard }}
                            />
                        </Stack>
                    </PaperProvider>
                </ApolloProvider>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.night,
    },
});
