import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Dialog, Divider, FAB, List, Portal, ProgressBar, Text, TextInput } from 'react-native-paper';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql, NetworkStatus } from '@apollo/client';
import { useRouter } from 'expo-router';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ListSkeletonRows from '@/components/ListSkeletonRows';

const GET_SPELL_LISTS = gql`
    query CurrentUserSpellLists {
        currentUserSpellLists {
            id
            name
        }
    }
`;

const CREATE_SPELL_LIST = gql`
    mutation CreateSpellList($name: String!) {
        createSpellList(name: $name) {
            id
            name
        }
    }
`;

export default function SpellListsScreen() {
    const router = useRouter();
    const [dialogVisible, setDialogVisible] = useState(false);
    const [newListName, setNewListName] = useState('');

    const { data, loading, networkStatus } = useQuery<{ currentUserSpellLists: { id: string; name: string }[] }>(GET_SPELL_LISTS, {
        notifyOnNetworkStatusChange: true,
        returnPartialData: true,
    });
    const [createSpellList] = useMutation(CREATE_SPELL_LIST, {
        refetchQueries: [{ query: GET_SPELL_LISTS }],
    });

    async function handleCreate() {
        if (!newListName.trim()) return;

        try {
            await createSpellList({ variables: { name: newListName.trim() } });
            setNewListName('');
            setDialogVisible(false);
        } catch (error) {
            console.error('Failed to create spell list:', error);
        }
    }

    const spellLists = (data?.currentUserSpellLists ?? []).flatMap((list) => {
        if (!list?.id || !list?.name) return [];
        return [{ id: list.id, name: list.name }];
    });
    const isInitialLoading = loading && spellLists.length === 0;
    const isRefetching = networkStatus === NetworkStatus.refetch && spellLists.length > 0;

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Spell Lists</Text>

            {isInitialLoading ? (
                <ListSkeletonRows rowCount={6} />
            ) : spellLists.length === 0 ? (
                <View style={styles.centered}>
                    <Text style={styles.emptyText}>
                        No spell lists yet. Tap + to create one.
                    </Text>
                </View>
            ) : (
                <View style={styles.listWrapper}>
                    {isRefetching && <ProgressBar indeterminate color={fantasyTokens.colors.gold} style={styles.progressBar} />}
                    <FlatList
                        data={spellLists}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
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
                                    onPress={() => router.push(`/spell-lists/${item.id}`)}
                                    right={(props) => (
                                        <List.Icon {...props} icon="chevron-right" color={fantasyTokens.colors.gold} />
                                    )}
                                />
                                <Divider style={styles.divider} />
                            </Animated.View>
                        )}
                    />
                </View>
            )}

            <FAB
                icon="plus"
                style={styles.fab}
                color={fantasyTokens.colors.parchment}
                onPress={() => setDialogVisible(true)}
            />

            <Portal>
                <Dialog
                    visible={dialogVisible}
                    onDismiss={() => setDialogVisible(false)}
                    style={styles.dialog}
                >
                    <Dialog.Title style={styles.dialogTitle}>New Spell List</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label="List name"
                            value={newListName}
                            onChangeText={setNewListName}
                            mode="outlined"
                            style={styles.dialogInput}
                            outlineColor={fantasyTokens.colors.gold}
                            activeOutlineColor={fantasyTokens.colors.crimson}
                            textColor={fantasyTokens.colors.inkDark}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button
                            textColor={fantasyTokens.colors.inkSoft}
                            onPress={() => setDialogVisible(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            textColor={fantasyTokens.colors.crimson}
                            onPress={handleCreate}
                        >
                            Create
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.night,
    },
    heading: {
        fontSize: 24,
        fontFamily: 'serif',
        color: fantasyTokens.colors.parchment,
        padding: fantasyTokens.spacing.md,
        paddingBottom: fantasyTokens.spacing.sm,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: fantasyTokens.spacing.lg,
    },
    emptyText: {
        color: fantasyTokens.colors.inkSoft,
        fontFamily: 'serif',
        fontSize: 16,
        textAlign: 'center',
    },
    listContent: {
        backgroundColor: fantasyTokens.colors.parchmentDeep,
        paddingBottom: fantasyTokens.spacing.lg,
    },
    listWrapper: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.parchmentDeep,
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
    fab: {
        position: 'absolute',
        right: fantasyTokens.spacing.lg,
        bottom: fantasyTokens.spacing.lg,
        backgroundColor: fantasyTokens.colors.crimson,
    },
    dialog: {
        backgroundColor: fantasyTokens.colors.parchment,
    },
    dialogTitle: {
        fontFamily: 'serif',
        color: fantasyTokens.colors.inkDark,
    },
    dialogInput: {
        backgroundColor: fantasyTokens.colors.parchment,
    },
});
