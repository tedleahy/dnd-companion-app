import { FlatList, StyleSheet } from 'react-native';
import { SpellQueryData } from './SpellSearch';
import { ActivityIndicator, Divider, List, MD3Theme, useTheme } from 'react-native-paper';
import { useMemo } from 'react';

type SpellListProps = {
    spells?: SpellQueryData[];
    loading: boolean;
};

export default function SpellList({ spells, loading }: SpellListProps) {
    const theme = useTheme();
    const themedStyles = useMemo(() => makeStyles(theme), [theme]);

    return loading ? (
        <ActivityIndicator />
    ) : (
        <FlatList
            data={spells ?? []}
            contentContainerStyle={themedStyles.listContent}
            renderItem={({ item }) => (
                <>
                    <List.Item
                        title={item.name}
                        titleStyle={themedStyles.listItemTitle}
                        style={themedStyles.listItem}
                        onPress={() => {}}
                    />
                    <Divider style={themedStyles.divider} />
                </>
            )}
        />
    );
}

function makeStyles(theme: MD3Theme) {
    return StyleSheet.create({
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
