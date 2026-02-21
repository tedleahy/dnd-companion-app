import { ScrollView, StyleSheet } from 'react-native';
import { Button, Modal, Portal, Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import FilterChipGroup from '@/components/FilterChipGroup';
import FilterSwitch from '@/components/FilterSwitch';

const ALL_CLASSES: { key: string; label: string }[] = [
    { key: 'bard', label: 'Bard' },
    { key: 'cleric', label: 'Cleric' },
    { key: 'druid', label: 'Druid' },
    { key: 'paladin', label: 'Paladin' },
    { key: 'ranger', label: 'Ranger' },
    { key: 'sorcerer', label: 'Sorcerer' },
    { key: 'warlock', label: 'Warlock' },
    { key: 'wizard', label: 'Wizard' },
];

const ALL_LEVELS: { key: string; label: string }[] = [
    { key: '0', label: 'Cantrip' },
    { key: '1', label: '1' },
    { key: '2', label: '2' },
    { key: '3', label: '3' },
    { key: '4', label: '4' },
    { key: '5', label: '5' },
    { key: '6', label: '6' },
    { key: '7', label: '7' },
    { key: '8', label: '8' },
    { key: '9', label: '9' },
];

const ALL_COMPONENTS: { key: string; label: string }[] = [
    { key: 'V', label: 'Verbal' },
    { key: 'S', label: 'Somatic' },
    { key: 'M', label: 'Material' },
];

const RANGE_CATEGORIES: { key: string; label: string }[] = [
    { key: 'self', label: 'Self' },
    { key: 'touch', label: 'Touch' },
    { key: 'short', label: 'Short (≤30 ft)' },
    { key: 'medium', label: 'Medium (31–120 ft)' },
    { key: 'long', label: 'Long (>120 ft)' },
    { key: 'sight', label: 'Sight' },
    { key: 'special', label: 'Special' },
];

const DURATION_CATEGORIES: { key: string; label: string }[] = [
    { key: 'instantaneous', label: 'Instantaneous' },
    { key: '1_round', label: '1 Round' },
    { key: 'up_to_1_minute', label: '≤1 Minute' },
    { key: 'up_to_10_minutes', label: '≤10 Minutes' },
    { key: 'up_to_1_hour', label: '≤1 Hour' },
    { key: 'up_to_8_hours', label: '≤8 Hours' },
    { key: 'up_to_24_hours', label: '≤24 Hours' },
    { key: 'days_plus', label: 'Days+' },
    { key: 'until_dispelled', label: 'Until Dispelled' },
    { key: 'special', label: 'Special' },
];

const CASTING_TIME_CATEGORIES: { key: string; label: string }[] = [
    { key: '1_action', label: '1 Action' },
    { key: '1_bonus_action', label: '1 Bonus Action' },
    { key: '1_reaction', label: '1 Reaction' },
    { key: '1_minute', label: '1 Minute' },
    { key: '10_minutes', label: '10 Minutes' },
    { key: '1_hour_plus', label: '1 Hour+' },
];

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
    concentration: boolean | undefined;
    hasHigherLevel: boolean | undefined;
    hasMaterial: boolean | undefined;
    components: string[];
    rangeCategories: string[];
    durationCategories: string[];
    castingTimeCategories: string[];
};

/** Default filter state with nothing selected. */
export const EMPTY_FILTERS: SpellFilters = {
    classes: [],
    levels: [],
    ritual: undefined,
    concentration: undefined,
    hasHigherLevel: undefined,
    hasMaterial: undefined,
    components: [],
    rangeCategories: [],
    durationCategories: [],
    castingTimeCategories: [],
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

    /** Toggles a string-keyed array filter field. */
    function toggleArrayFilter(field: keyof SpellFilters, key: string) {
        const current = filters[field] as string[];
        onChange({ ...filters, [field]: toggle(current, key) });
    }

    /** Toggles a level (stored as number[], but chip keys are strings). */
    function toggleLevel(key: string) {
        const num = Number(key);
        onChange({ ...filters, levels: toggle(filters.levels, num) });
    }

    /** Toggles a boolean | undefined filter between `true` and `undefined`. */
    function toggleBoolFilter(field: keyof SpellFilters) {
        onChange({ ...filters, [field]: filters[field] ? undefined : true });
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

                    <FilterChipGroup
                        label="Class"
                        options={ALL_CLASSES}
                        selected={filters.classes}
                        onToggle={(key) => toggleArrayFilter('classes', key)}
                    />

                    <FilterChipGroup
                        label="Level"
                        options={ALL_LEVELS}
                        selected={filters.levels.map(String)}
                        onToggle={toggleLevel}
                    />

                    <FilterSwitch label="Ritual only" value={filters.ritual === true} onToggle={() => toggleBoolFilter('ritual')} />
                    <FilterSwitch label="Concentration" value={filters.concentration === true} onToggle={() => toggleBoolFilter('concentration')} />
                    <FilterSwitch label="Has higher level" value={filters.hasHigherLevel === true} onToggle={() => toggleBoolFilter('hasHigherLevel')} />
                    <FilterSwitch label="Requires material" value={filters.hasMaterial === true} onToggle={() => toggleBoolFilter('hasMaterial')} />

                    <FilterChipGroup
                        label="Components"
                        options={ALL_COMPONENTS}
                        selected={filters.components}
                        onToggle={(key) => toggleArrayFilter('components', key)}
                    />

                    <FilterChipGroup
                        label="Range"
                        options={RANGE_CATEGORIES}
                        selected={filters.rangeCategories}
                        onToggle={(key) => toggleArrayFilter('rangeCategories', key)}
                    />

                    <FilterChipGroup
                        label="Duration"
                        options={DURATION_CATEGORIES}
                        selected={filters.durationCategories}
                        onToggle={(key) => toggleArrayFilter('durationCategories', key)}
                    />

                    <FilterChipGroup
                        label="Casting Time"
                        options={CASTING_TIME_CATEGORIES}
                        selected={filters.castingTimeCategories}
                        onToggle={(key) => toggleArrayFilter('castingTimeCategories', key)}
                    />

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
    clearButton: {
        marginTop: fantasyTokens.spacing.lg,
        borderColor: fantasyTokens.colors.gold,
    },
});
