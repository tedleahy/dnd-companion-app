import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Modal, Portal, Switch, Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

const ALL_CLASSES = [
    'bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard',
];

const ALL_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * Active filter criteria for the spell list.
 *
 * @property classes - Selected class indexes (e.g. `['wizard', 'cleric']`). Empty means no class filter.
 * @property levels - Selected spell levels (0 = cantrip). Empty means no level filter.
 * @property ritual - `true` to show only ritual spells; `undefined` for no ritual filter.
 */
export type SpellFilters = {
    classes: string[];
    levels: number[];
    ritual: boolean | undefined;
};

/** Default filter state with nothing selected. */
export const EMPTY_FILTERS: SpellFilters = {
    classes: [],
    levels: [],
    ritual: undefined,
};

/**
 * Props for {@link SpellFilterDrawer}.
 *
 * @property visible - Whether the drawer modal is shown.
 * @property filters - Current filter state.
 * @property onClose - Called when the user dismisses the drawer.
 * @property onChange - Called with the updated filters whenever a selection changes.
 */
type SpellFilterDrawerProps = {
    visible: boolean;
    filters: SpellFilters;
    onClose: () => void;
    onChange: (filters: SpellFilters) => void;
};

/**
 * A slide-in modal drawer that lets the user filter spells by class, level, and ritual status.
 * Renders chip groups for class/level and a toggle switch for ritual-only mode.
 */
export default function SpellFilterDrawer({ visible, filters, onClose, onChange }: SpellFilterDrawerProps) {
    /** Toggles an element in/out of an array, returning a new array. */
    function toggle<T>(array: T[], item: T): T[] {
        return array.includes(item)
            ? array.filter((x) => x !== item)
            : [...array, item];
    }

    /** Toggles a class filter on or off. */
    function toggleClass(cls: string) {
        onChange({ ...filters, classes: toggle(filters.classes, cls) });
    }

    /** Toggles a level filter on or off. */
    function toggleLevel(level: number) {
        onChange({ ...filters, levels: toggle(filters.levels, level) });
    }

    /** Toggles the ritual-only filter between `true` and `undefined`. */
    function toggleRitual() {
        onChange({ ...filters, ritual: filters.ritual ? undefined : true });
    }

    /** Resets all filters to {@link EMPTY_FILTERS}. */
    function clearAll() {
        onChange(EMPTY_FILTERS);
    }

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onClose}
                contentContainerStyle={styles.drawer}
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={styles.drawerTitle}>Filters</Text>

                    {/* ── Class ── */}
                    <Text style={styles.sectionLabel}>Class</Text>
                    <View style={styles.chipRow}>
                        {ALL_CLASSES.map((cls) => (
                            <Chip
                                key={cls}
                                selected={filters.classes.includes(cls)}
                                onPress={() => toggleClass(cls)}
                                style={[
                                    styles.chip,
                                    filters.classes.includes(cls) && styles.chipSelected,
                                ]}
                                textStyle={[
                                    styles.chipText,
                                    filters.classes.includes(cls) && styles.chipTextSelected,
                                ]}
                                showSelectedOverlay={false}
                                showSelectedCheck={false}
                            >
                                {cls.charAt(0).toUpperCase() + cls.slice(1)}
                            </Chip>
                        ))}
                    </View>

                    {/* ── Level ── */}
                    <Text style={styles.sectionLabel}>Level</Text>
                    <View style={styles.chipRow}>
                        {ALL_LEVELS.map((level) => (
                            <Chip
                                key={level}
                                selected={filters.levels.includes(level)}
                                onPress={() => toggleLevel(level)}
                                style={[
                                    styles.chip,
                                    filters.levels.includes(level) && styles.chipSelected,
                                ]}
                                textStyle={[
                                    styles.chipText,
                                    filters.levels.includes(level) && styles.chipTextSelected,
                                ]}
                                showSelectedOverlay={false}
                                showSelectedCheck={false}
                            >
                                {level === 0 ? 'Cantrip' : String(level)}
                            </Chip>
                        ))}
                    </View>

                    {/* ── Ritual ── */}
                    <View style={styles.switchRow}>
                        <Text style={styles.sectionLabel}>Ritual only</Text>
                        <Switch
                            value={filters.ritual === true}
                            onValueChange={toggleRitual}
                            color={fantasyTokens.colors.crimson}
                        />
                    </View>

                    {/* ── Clear ── */}
                    <Button
                        mode="outlined"
                        onPress={clearAll}
                        style={styles.clearButton}
                        textColor={fantasyTokens.colors.parchment}
                    >
                        Clear all
                    </Button>
                </ScrollView>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    drawer: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: '80%',
        backgroundColor: fantasyTokens.colors.night,
        padding: fantasyTokens.spacing.md,
        borderLeftWidth: 1,
        borderLeftColor: fantasyTokens.colors.gold,
    },
    drawerTitle: {
        fontSize: 22,
        fontFamily: 'serif',
        color: fantasyTokens.colors.parchment,
        marginBottom: fantasyTokens.spacing.md,
    },
    sectionLabel: {
        fontSize: 14,
        fontFamily: 'serif',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.gold,
        marginTop: fantasyTokens.spacing.md,
        marginBottom: fantasyTokens.spacing.sm,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: fantasyTokens.spacing.sm,
    },
    chip: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: fantasyTokens.colors.gold,
    },
    chipSelected: {
        backgroundColor: fantasyTokens.colors.crimson,
        borderColor: fantasyTokens.colors.crimson,
    },
    chipText: {
        color: fantasyTokens.colors.parchment,
        fontFamily: 'serif',
    },
    chipTextSelected: {
        color: fantasyTokens.colors.parchment,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: fantasyTokens.spacing.md,
    },
    clearButton: {
        marginTop: fantasyTokens.spacing.lg,
        borderColor: fantasyTokens.colors.gold,
    },
});
