import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { ActivityIndicator, Button, Divider, List, Searchbar, useTheme } from 'react-native-paper';
import { makeSpellListStyles } from './SpellList.styles';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

type SearchParams = {
    name?: string;
};

const GET_SPELLS = gql`
    query Spells {
        spells {
            id
            name
        }
    }
`;

type SpellsQueryData = {
    spells: Array<{
        id: string;
        name: string;
    }>;
}

export default function SpellList() {
    const [searchParams, setSearchParams] = useState<SearchParams>({});
    const { data, loading, error } = useQuery<SpellsQueryData>(GET_SPELLS);
    if (error) console.error(`Error loading spells: ${error}`);
    const spells = data?.spells ?? [];

    const theme = useTheme();
    const themedStyles = useMemo(() => makeSpellListStyles(theme), [theme]);

    return loading ? (
        <ActivityIndicator />
    ) : (
        <View style={themedStyles.container}>
            <Searchbar
                style={themedStyles.searchBar}
                inputStyle={{ color: theme.colors.onSurface }}
                iconColor={theme.colors.onSurfaceVariant}
                placeholderTextColor={theme.colors.onSurfaceVariant}
                placeholder="Search spells..."
                onChangeText={(text) => setSearchParams((prev) => ({ ...prev, name: text }))}
                value={searchParams.name || ''}
            />
            <Button icon="filter" mode="outlined" onPress={() => {}} style={{ margin: 8 }}>
                Filter
            </Button>
            <FlatList
                data={spells}
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
        </View>
    );
}
