import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, MD3Theme, Searchbar, useTheme } from 'react-native-paper';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import SpellList from './SpellList';

type SearchParams = {
    name?: string;
};

const GET_SPELLS = gql`
    query Spells($filter: SpellFilter) {
        spells(filter: $filter) {
            id
            name
        }
    }
`;

export type SpellQueryData = {
    id: string;
    name: string;
};

type SpellsQueryData = {
    spells: SpellQueryData[];
};

export default function SpellSearch() {
    const [searchParams, setSearchParams] = useState<SearchParams>({});

    const { data, loading, error } = useQuery<SpellsQueryData>(GET_SPELLS, {
        variables: {
            filter: searchParams.name ? { name: searchParams.name } : undefined,
        },
    });
    if (error) console.error(`Error loading spells: ${error}`);
    const spells = data?.spells ?? [];

    const theme = useTheme();
    const themedStyles = useMemo(() => makeStyles(theme), [theme]);

    return (
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
            <SpellList spells={spells} loading={loading} />
        </View>
    );
}

function makeStyles(theme: MD3Theme) {
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
    });
}
