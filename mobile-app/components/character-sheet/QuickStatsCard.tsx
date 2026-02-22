import { StyleSheet, View } from 'react-native';
import { formatSignedNumber } from '@/lib/characterSheetUtils';
import SheetCard from './SheetCard';
import StatPill from './StatPill';

type QuickStatsCardProps = {
    proficiencyBonus: number;
    initiative: number;
    inspiration: boolean;
    spellSaveDC: number | null;
    onToggleInspiration: () => void;
};

export default function QuickStatsCard({
    proficiencyBonus,
    initiative,
    inspiration,
    spellSaveDC,
    onToggleInspiration,
}: QuickStatsCardProps) {
    const basePills = [
        { label: 'Proficiency', value: formatSignedNumber(proficiencyBonus) },
        { label: 'Initiative', value: formatSignedNumber(initiative) },
    ];

    return (
        <SheetCard index={1}>
            <View style={styles.row}>
                {basePills.map((pill) => (
                    <StatPill key={pill.label} label={pill.label} value={pill.value} />
                ))}
                <StatPill
                    label={inspiration ? 'Inspired' : 'Inspiration'}
                    value={'\u2726'}
                    onPress={onToggleInspiration}
                    accessibilityLabel="Toggle inspiration"
                    isActive={inspiration}
                />
                {spellSaveDC != null && (
                    <StatPill label="Spell DC" value={String(spellSaveDC)} />
                )}
            </View>
        </SheetCard>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: 7,
        padding: 12,
        paddingHorizontal: 18,
        paddingBottom: 16,
    },
});
