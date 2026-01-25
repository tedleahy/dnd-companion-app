import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Searchbar } from 'react-native-paper';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import SpellList from '../components/SpellList';
import { fantasyTokens } from '../theme/fantasyTheme';

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

    return (
        <View style={styles.container}>
            <Searchbar
                style={styles.searchBar}
                inputStyle={{ color: fantasyTokens.colors.inkDark, fontFamily: 'serif' }}
                iconColor={fantasyTokens.colors.ember}
                placeholderTextColor={fantasyTokens.colors.inkSoft}
                placeholder="Search spells..."
                onChangeText={(text) => setSearchParams((prev) => ({ ...prev, name: text }))}
                value={searchParams.name || ''}
            />
            <Button
                icon="filter"
                mode="outlined"
                onPress={() => {}}
                style={styles.filterButton}
                textColor={fantasyTokens.colors.parchment}
            >
                Filter
            </Button>
            <SpellList spells={spells} loading={loading} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.night,
    },
    searchBar: {
        margin: fantasyTokens.spacing.md,
        marginBottom: 0,
        backgroundColor: fantasyTokens.colors.parchment,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.gold,
    },
    filterButton: {
        margin: fantasyTokens.spacing.md,
        borderColor: fantasyTokens.colors.gold,
    },
});
