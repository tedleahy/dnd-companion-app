import { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { fantasyTokens } from '@/theme/fantasyTheme';
import SpellbookCard from './spells/SpellbookCard';
import SpellcastingStatsCard from './spells/SpellcastingStatsCard';
import SpellSlotsCard from './spells/SpellSlotsCard';

type CharacterSpellSlot = {
    id: string;
    level: number;
    total: number;
    used: number;
};

type CharacterSpellbookEntry = {
    prepared: boolean;
    spell: {
        id: string;
        name: string;
        level: number;
        schoolIndex: string;
        castingTime: string;
        range?: string | null;
        concentration: boolean;
        ritual: boolean;
    };
};

type SpellsTabProps = {
    spellcastingAbility?: string | null;
    spellSaveDC?: number | null;
    spellAttackBonus?: number | null;
    spellSlots: CharacterSpellSlot[];
    spellbook: CharacterSpellbookEntry[];
    onToggleSpellSlot?: (level: number) => Promise<void>;
    onSetSpellPrepared?: (spellId: string, prepared: boolean) => Promise<void>;
};

export default function SpellsTab({
    spellcastingAbility,
    spellSaveDC,
    spellAttackBonus,
    spellSlots,
    spellbook,
    onToggleSpellSlot,
    onSetSpellPrepared,
}: SpellsTabProps) {
    const router = useRouter();

    const preparedCount = useMemo(() => {
        return spellbook.filter((entry) => entry.prepared).length;
    }, [spellbook]);

    const handleOpenSpell = useCallback((spellId: string) => {
        router.push(`/spells/${spellId}`);
    }, [router]);

    const handleAddSpell = useCallback(() => {
        router.push('/spells');
    }, [router]);

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <SpellcastingStatsCard
                    spellcastingAbility={spellcastingAbility}
                    spellAttackBonus={spellAttackBonus}
                    spellSaveDC={spellSaveDC}
                    preparedCount={preparedCount}
                />

                <SpellSlotsCard
                    spellSlots={spellSlots}
                    onToggleSpellSlot={onToggleSpellSlot}
                />

                <SpellbookCard
                    spellbook={spellbook}
                    onOpenSpell={handleOpenSpell}
                    onSetPrepared={onSetSpellPrepared}
                />

                <Pressable
                    style={styles.addButton}
                    onPress={handleAddSpell}
                    accessibilityRole="button"
                    accessibilityLabel="Add spell"
                >
                    <Text style={styles.addButtonText}>+ Add Spell</Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.night,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: fantasyTokens.spacing.md,
        paddingTop: 10,
        paddingBottom: fantasyTokens.spacing.xl * 2,
        gap: 12,
    },
    addButton: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.3)',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 13,
    },
    addButtonText: {
        fontFamily: 'serif',
        fontSize: 10,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.gold,
        opacity: 0.7,
    },
});
