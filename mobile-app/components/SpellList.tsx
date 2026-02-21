import { FlatList, StyleSheet, View } from 'react-native';
import { Divider, List, ProgressBar, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { fantasyTokens } from '../theme/fantasyTheme';
import ListSkeletonRows from './ListSkeletonRows';

type SpellListProps = {
    spells?: { id: string; name: string }[];
    loading: boolean;
};

export default function SpellList({ spells, loading }: SpellListProps) {
    const router = useRouter();
    const items = spells ?? [];
    const isInitialLoading = loading && items.length === 0;

    if (isInitialLoading) {
        return <ListSkeletonRows rowCount={7} />;
    }

    return (
        <View style={styles.listWrapper}>
            {loading && <ProgressBar indeterminate color={fantasyTokens.colors.gold} style={styles.progressBar} />}
            <FlatList
                data={items}
                contentContainerStyle={styles.listContent}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={<Text style={styles.emptyText}>No spells match this search yet.</Text>}
                renderItem={({ item, index }) => (
                    <Animated.View
                        entering={FadeInDown.duration(fantasyTokens.motion.standard)
                            .delay(Math.min(index, 8) * fantasyTokens.motion.stagger)
                            .springify()}
                    >
                        <List.Item
                            title={item.name}
                            titleStyle={styles.listItemTitle}
                            style={styles.listItem}
                            onPress={() => router.push(`/spells/${item.id}`)}
                            right={(props) => <List.Icon {...props} icon="chevron-right" color={fantasyTokens.colors.gold} />}
                        />
                        <Divider style={styles.divider} />
                    </Animated.View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    listWrapper: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.parchmentDeep,
    },
    listContent: {
        flexGrow: 1,
        backgroundColor: fantasyTokens.colors.parchmentDeep,
        paddingBottom: fantasyTokens.spacing.lg,
    },
    progressBar: {
        height: 3,
        backgroundColor: 'rgba(196, 164, 112, 0.2)',
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
    emptyText: {
        textAlign: 'center',
        color: fantasyTokens.colors.inkSoft,
        fontFamily: 'serif',
        marginTop: fantasyTokens.spacing.xl,
    },
});
