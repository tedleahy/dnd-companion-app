import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Dialog, Divider, List, MD3Theme, Portal, Snackbar, Text, useTheme } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { fantasyTokens } from '../../theme/fantasyTheme';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { DetailRow, ParchmentPanel, RuneDivider } from '../../components/FantasyPrimitives';
import { Spell } from '../../types/generated_graphql_types';

const GET_SPELL_LISTS = gql`
    query SpellDetailLists {
        currentUserSpellLists {
            id
            name
        }
    }
`;

const ADD_SPELL_TO_LIST = gql`
    mutation AddSpellToList($spellListId: ID!, $spellId: ID!) {
        addSpellToList(spellListId: $spellListId, spellId: $spellId) {
            id
            spells {
                id
                name
            }
        }
    }
`;

const GET_SPELL = gql`
    query Spell($id: ID!) {
        spell(id: $id) {
            id
            name
            level
            schoolIndex
            classIndexes
            description
            higherLevel
            range
            components
            material
            ritual
            duration
            concentration
            castingTime
        }
    }
`;

type SpellDetailsQueryData = {
    spell?: Spell;
};

export default function SpellDetails() {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const [listDialogVisible, setListDialogVisible] = useState(false);
    const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

    const { data, loading, error } = useQuery<SpellDetailsQueryData>(GET_SPELL, {
        variables: { id: id ?? '' },
        skip: !id,
    });
    if (error) console.error(`Error loading spell details: ${error}`);

    const { data: listsData } = useQuery<{ currentUserSpellLists: Array<{ id: string; name: string }> }>(GET_SPELL_LISTS);
    const [addSpellToList] = useMutation(ADD_SPELL_TO_LIST);

    async function handleAddToList(spellListId: string, listName: string) {
        if (!id) return;

        try {
            await addSpellToList({ variables: { spellListId, spellId: id } });
            setListDialogVisible(false);
            setSnackbar({ visible: true, message: `Added to ${listName}` });
        } catch (err) {
            console.error('Failed to add spell to list:', err);
        }
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator />
            </View>
        );
    }

    const spell = data?.spell;
    if (!spell) {
        return (
            <View style={styles.container}>
                <Text style={styles.stateText}>Spell not found.</Text>
            </View>
        );
    }

    const {
        name,
        description,
        higherLevel,
        range,
        components,
        material,
        ritual,
        duration,
        concentration,
        castingTime,
    } = spell;

    const componentsLabel = material
        ? `${components.join(', ')} (${material})`
        : components.join(', ');

    return (
        <ScrollView style={styles.page} contentContainerStyle={styles.content}>
            <ParchmentPanel style={styles.headerPanel} variant="light" elevation={2}>
                <Text style={styles.kicker}>Spell Codex</Text>
                <Text style={styles.title}>{name}</Text>
                <Text style={styles.subtitle}>{schoolAndLevelLabel(spell)}</Text>
            </ParchmentPanel>

            <ParchmentPanel style={styles.detailPanel} elevation={1}>
                <DetailRow label="Casting Time" value={castingTime} />
                <DetailRow label="Range" value={range ?? '—'} />
                <DetailRow label="Components" value={componentsLabel} />
                <DetailRow label="Duration" value={duration ?? '—'} />
                <View style={styles.tagRow}>
                    {ritual && (
                        <Chip compact style={styles.tagChip} textStyle={styles.tagText}>
                            Ritual
                        </Chip>
                    )}
                    {concentration && (
                        <Chip compact style={styles.tagChip} textStyle={styles.tagText}>
                            Concentration
                        </Chip>
                    )}
                </View>
            </ParchmentPanel>

            <ParchmentPanel style={styles.detailPanel} elevation={1}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.body}>{description.join('\n\n')}</Text>
                <Divider style={styles.divider} />
                {higherLevel.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>At Higher Levels</Text>
                        <Text style={styles.body}>{higherLevel.join('\n\n')}</Text>
                    </>
                )}
            </ParchmentPanel>

            <Button
                icon="bookmark-plus-outline"
                mode="outlined"
                style={styles.addToListButton}
                textColor={fantasyTokens.colors.parchment}
                onPress={() => setListDialogVisible(true)}
            >
                Add to Spell List
            </Button>

            <RuneDivider />

            <Portal>
                <Dialog
                    visible={listDialogVisible}
                    onDismiss={() => setListDialogVisible(false)}
                    style={styles.dialog}
                >
                    <Dialog.Title style={styles.dialogTitle}>Add to Spell List</Dialog.Title>
                    <Dialog.ScrollArea style={{ maxHeight: 300 }}>
                        <FlatList
                            data={listsData?.currentUserSpellLists ?? []}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <List.Item
                                    title={item.name}
                                    titleStyle={styles.dialogListItemTitle}
                                    onPress={() => handleAddToList(item.id, item.name)}
                                />
                            )}
                            ListEmptyComponent={
                                <Text style={styles.dialogEmptyText}>
                                    No spell lists yet. Create one from the Spell Lists tab.
                                </Text>
                            }
                        />
                    </Dialog.ScrollArea>
                    <Dialog.Actions>
                        <Button
                            textColor={fantasyTokens.colors.inkSoft}
                            onPress={() => setListDialogVisible(false)}
                        >
                            Cancel
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            <Snackbar
                visible={snackbar.visible}
                onDismiss={() => setSnackbar({ visible: false, message: '' })}
                duration={2000}
                style={styles.snackbar}
            >
                {snackbar.message}
            </Snackbar>
        </ScrollView>
    );
}

function schoolAndLevelLabel({ level, schoolIndex }: Spell): string {
    const school = schoolIndex.replace(/\b\w/g, (match) => match.toUpperCase());

    if (level === 0) return `${school} Cantrip`;

    const suffixes: Record<number,string> = {
        1: 'st',
        2: 'nd',
        3: 'rd',
    };
    const suffix = suffixes[level] ?? 'th';

    return `${level}${suffix} level ${school}`;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: fantasyTokens.colors.night,
        padding: fantasyTokens.spacing.md,
    },
    stateText: {
        color: fantasyTokens.colors.parchment,
        fontFamily: 'serif',
        fontSize: 16,
    },
    page: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.night,
    },
    content: {
        padding: fantasyTokens.spacing.lg,
        gap: fantasyTokens.spacing.md,
    },
    headerPanel: {
        padding: fantasyTokens.spacing.lg,
        borderRadius: fantasyTokens.radii.lg,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    kicker: {
        fontSize: 12,
        letterSpacing: 3,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.ember,
        fontFamily: 'serif',
        marginBottom: fantasyTokens.spacing.sm,
    },
    title: {
        fontSize: 30,
        color: fantasyTokens.colors.inkDark,
        fontFamily: 'serif',
        marginBottom: fantasyTokens.spacing.xs,
    },
    subtitle: {
        fontSize: 16,
        color: fantasyTokens.colors.inkSoft,
        fontFamily: 'serif',
    },
    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },
    chip: {
        backgroundColor: fantasyTokens.colors.inkDark,
    },
    chipText: {
        color: fantasyTokens.colors.parchment,
        fontFamily: 'serif',
    },
    detailPanel: {
        padding: fantasyTokens.spacing.md,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 12,
    },
    tagChip: {
        backgroundColor: fantasyTokens.colors.crimson,
    },
    tagText: {
        color: fantasyTokens.colors.parchment,
        fontFamily: 'serif',
    },
    sectionTitle: {
        fontSize: 14,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.ember,
        marginBottom: fantasyTokens.spacing.sm,
        fontFamily: 'serif',
    },
    body: {
        fontSize: 16,
        lineHeight: 24,
        color: fantasyTokens.colors.inkDark,
        fontFamily: 'serif',
    },
    divider: {
        marginVertical: fantasyTokens.spacing.sm,
        backgroundColor: fantasyTokens.colors.gold,
    },
    addToListButton: {
        borderColor: fantasyTokens.colors.gold,
    },
    dialog: {
        backgroundColor: fantasyTokens.colors.parchment,
    },
    dialogTitle: {
        fontFamily: 'serif',
        color: fantasyTokens.colors.inkDark,
    },
    dialogListItemTitle: {
        fontFamily: 'serif',
        color: fantasyTokens.colors.inkDark,
    },
    dialogEmptyText: {
        fontFamily: 'serif',
        color: fantasyTokens.colors.inkSoft,
        textAlign: 'center',
        padding: fantasyTokens.spacing.md,
    },
    snackbar: {
        backgroundColor: fantasyTokens.colors.inkDark,
    },
});
