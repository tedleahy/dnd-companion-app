import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Divider, List } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { fantasyTokens } from '../theme/fantasyTheme';

type SpellListProps = {
    spells?: Array<{ id: string; name: string }>;
    loading: boolean;
};

export default function SpellList({ spells, loading }: SpellListProps) {
    const router = useRouter();

    return loading ? (
        <View style={styles.listContent}>
            <ActivityIndicator />
        </View>
    ) : (
        <FlatList
            data={spells ?? []}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
                <>
                    <List.Item
                        title={item.name}
                        titleStyle={styles.listItemTitle}
                        style={styles.listItem}
                        onPress={() => router.push(`/spell/${item.id}`)}
                    />
                    <Divider style={styles.divider} />
                </>
            )}
        />
    );
}

const styles = StyleSheet.create({
    listContent: {
        backgroundColor: fantasyTokens.colors.parchmentDeep,
        paddingBottom: fantasyTokens.spacing.lg,
        height: '100%',
    },
    listItem: {
        backgroundColor: fantasyTokens.colors.parchmentDeep,
    },
    listItemTitle: {
        fontSize: 18,
        color: fantasyTokens.colors.inkDark,
        fontFamily: 'serif',
    },
    divider: {
        backgroundColor: fantasyTokens.colors.gold,
    },
});
