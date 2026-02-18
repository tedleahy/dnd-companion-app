import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Divider, FAB, List, Text } from 'react-native-paper';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useRouter } from 'expo-router';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { FlatList } from 'react-native';
import { useState } from 'react';
import { Button, Dialog, Portal, TextInput } from 'react-native-paper';

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

    const { data, loading } = useQuery<{ currentUserSpellLists: Array<{ id: string; name: string }> }>(GET_SPELL_LISTS);
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

    const spellLists = data?.currentUserSpellLists ?? [];

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Spell Lists</Text>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator />
                </View>
            ) : spellLists.length === 0 ? (
                <View style={styles.centered}>
                    <Text style={styles.emptyText}>
                        No spell lists yet. Tap + to create one.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={spellLists}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <>
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
                        </>
                    )}
                />
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
