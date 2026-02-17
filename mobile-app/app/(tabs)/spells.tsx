import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Searchbar, Text } from 'react-native-paper';
import { useQuery } from '@apollo/client/react';
import SpellList from '@/components/SpellList';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { gql } from '@apollo/client';
import { SpellsQuery } from '@/types/generated_graphql_types';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

type SearchParams = {
    name?: string;
    levels?: number[];
    classes?: string[];
};

const SEARCH_SPELLS = gql`
    query Spells($filter: SpellFilter) {
        spells(filter: $filter) {
            id
            name
        }
    }
`;

export default function SpellSearch() {
    const [searchParams, setSearchParams] = useState<SearchParams>({
        levels: [1],
        classes: ['paladin'],
    });
    const router = useRouter();

    const { data, loading, error } = useQuery<SpellsQuery>(SEARCH_SPELLS, {
        variables: {
            filter: searchParams.name ? { name: searchParams.name } : undefined,
        },
    });
    const isUnauthenticated = error?.message === 'UNAUTHENTICATED';

    useEffect(() => {
        if (isUnauthenticated) router.replace('/(auth)/sign-in');
    }, [isUnauthenticated]);

    const spells = data?.spells ?? [];

    async function signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) console.error(error);
        router.replace('/(auth)/sign-in');
    }

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
                // onPress={() => {}}
                onPress={signOut}
                style={styles.filterButton}
                textColor={fantasyTokens.colors.parchment}
            >
                Filter
            </Button>
            <SpellList spells={spells} loading={loading || isUnauthenticated} />
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
