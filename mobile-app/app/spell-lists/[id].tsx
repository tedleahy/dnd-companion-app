import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Dialog, IconButton, Portal, Text, TextInput } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { gql, NetworkStatus } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import SpellList from '@/components/SpellList';
import { fantasyTokens } from '@/theme/fantasyTheme';

const GET_SPELL_LIST = gql`
    query SpellList {
        currentUserSpellLists {
            id
            name
            spells {
                id
                name
            }
        }
    }
`;

const RENAME_SPELL_LIST = gql`
    mutation RenameSpellList($id: ID!, $name: String!) {
        renameSpellList(id: $id, name: $name)
    }
`;

const DELETE_SPELL_LIST = gql`
    mutation DeleteSpellList($id: ID!) {
        deleteSpellList(id: $id)
    }
`;

type SpellListData = {
    currentUserSpellLists?: {
        id: string;
        name: string;
        spells: { id: string; name: string }[];
    }[];
};

export default function SpellListDetail() {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const router = useRouter();
    const [renameDialogVisible, setRenameDialogVisible] = useState(false);
    const [newName, setNewName] = useState('');

    const { data, loading, networkStatus } = useQuery<SpellListData>(GET_SPELL_LIST, {
        notifyOnNetworkStatusChange: true,
        returnPartialData: true,
    });

    const [renameSpellList] = useMutation(RENAME_SPELL_LIST, {
        refetchQueries: [{ query: GET_SPELL_LIST }],
    });

    const [deleteSpellList] = useMutation(DELETE_SPELL_LIST);

    const spellList = data?.currentUserSpellLists?.find((list) => list.id === id);
    const spellItems = (spellList?.spells ?? []).flatMap((spell) => {
        if (!spell?.id || !spell?.name) return [];
        return [{ id: spell.id, name: spell.name }];
    });
    const isInitialLoading = loading && !spellList;
    const isRefetching = networkStatus === NetworkStatus.refetch && !!spellList;

    async function handleRename() {
        if (!newName.trim() || !id) return;

        try {
            await renameSpellList({ variables: { id, name: newName.trim() } });
            setNewName('');
            setRenameDialogVisible(false);
        } catch (error) {
            console.error('Failed to rename spell list:', error);
        }
    }

    async function handleDelete() {
        if (!id) return;

        try {
            await deleteSpellList({ variables: { id } });
            router.back();
        } catch (error) {
            console.error('Failed to delete spell list:', error);
        }
    }

    if (isInitialLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator />
            </View>
        );
    }

    if (!spellList) {
        return (
            <View style={styles.centered}>
                <Text style={styles.emptyText}>Spell list not found.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <IconButton
                    icon="arrow-left"
                    iconColor={fantasyTokens.colors.parchment}
                    onPress={() => router.back()}
                />
                <Text style={styles.title} numberOfLines={1}>
                    {spellList.name}
                </Text>
                <IconButton
                    icon="pencil"
                    iconColor={fantasyTokens.colors.gold}
                    onPress={() => {
                        setNewName(spellList.name ?? '');
                        setRenameDialogVisible(true);
                    }}
                />
                <IconButton
                    icon="delete"
                    iconColor={fantasyTokens.colors.crimson}
                    onPress={handleDelete}
                />
            </View>

            {spellItems.length === 0 ? (
                <View style={styles.centered}>
                    <Text style={styles.emptyText}>
                        No spells in this list yet.{'\n'}Add spells from the spell detail page.
                    </Text>
                </View>
            ) : (
                <SpellList spells={spellItems} loading={isRefetching} />
            )}

            <Portal>
                <Dialog
                    visible={renameDialogVisible}
                    onDismiss={() => setRenameDialogVisible(false)}
                    style={styles.dialog}
                >
                    <Dialog.Title style={styles.dialogTitle}>Rename Spell List</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label="List name"
                            value={newName}
                            onChangeText={setNewName}
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
                            onPress={() => setRenameDialogVisible(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            textColor={fantasyTokens.colors.crimson}
                            onPress={handleRename}
                        >
                            Rename
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
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: fantasyTokens.colors.night,
        padding: fantasyTokens.spacing.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: fantasyTokens.spacing.sm,
    },
    title: {
        flex: 1,
        fontSize: 22,
        fontFamily: 'serif',
        color: fantasyTokens.colors.parchment,
    },
    emptyText: {
        color: fantasyTokens.colors.inkSoft,
        fontFamily: 'serif',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
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
