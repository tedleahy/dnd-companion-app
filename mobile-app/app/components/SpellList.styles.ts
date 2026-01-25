import { StyleSheet } from 'react-native';
import type { MD3Theme } from 'react-native-paper';

export function makeSpellListStyles(theme: MD3Theme) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        searchBar: {
            margin: 8,
            marginBottom: 0,
            backgroundColor: theme.colors.surface,
        },
        listContent: {
            backgroundColor: theme.colors.background,
        },
        listItem: {
            backgroundColor: theme.colors.surface,
        },
        listItemTitle: {
            fontSize: 18,
            color: theme.colors.onSurface,
        },
        divider: {
            backgroundColor: theme.colors.outlineVariant,
        },
    });
}
