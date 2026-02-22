import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { ProficienciesAndLanguages } from '@/components/character-sheet/features/features.types';
import SectionLabel from '../SectionLabel';
import SheetCard from '../SheetCard';

/**
 * Props for the proficiencies/languages summary card.
 */
type ProficienciesCardProps = {
    data: ProficienciesAndLanguages;
    index: number;
};

/**
 * Props for one labeled proficiency row.
 */
type ProficiencyRowProps = {
    label: string;
    values: string[];
};

/**
 * Renders one proficiency category as a set of pill tags.
 */
function ProficiencyRow({ label, values }: ProficiencyRowProps) {
    return (
        <View style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <View style={styles.tags}>
                {values.map((value) => (
                    <View key={value} style={styles.tag}>
                        <Text style={styles.tagText}>{value}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

/**
 * Displays armor/weapon/tool/language proficiencies.
 */
export default function ProficienciesCard({
    data,
    index,
}: ProficienciesCardProps) {
    return (
        <SheetCard index={index}>
            <SectionLabel>Proficiencies & Languages</SectionLabel>
            <View style={styles.block}>
                <ProficiencyRow label="Armor" values={data.armor} />
                <ProficiencyRow label="Weapons" values={data.weapons} />
                <ProficiencyRow label="Tools" values={data.tools} />
                <ProficiencyRow label="Languages" values={data.languages} />
            </View>
        </SheetCard>
    );
}

/** Styles for proficiency rows and tags. */
const styles = StyleSheet.create({
    block: {
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 14,
        gap: 12,
    },
    row: {
        gap: 6,
    },
    rowLabel: {
        fontFamily: 'serif',
        fontSize: 8,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.inkLight,
        opacity: 0.45,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
    },
    tag: {
        borderRadius: 6,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.divider,
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    tagText: {
        fontFamily: 'serif',
        fontSize: 12,
        color: fantasyTokens.colors.inkLight,
    },
});
