import { StyleSheet, View, ScrollView } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import CharacterSheetHeader from '@/components/character-sheet/CharacterSheetHeader';
import type { CharacterSheetTab } from '@/components/character-sheet/CharacterSheetHeader';
import VitalsCard from '@/components/character-sheet/VitalsCard';
import QuickStatsCard from '@/components/character-sheet/QuickStatsCard';
import AbilityScoresAndSkillsCard from '@/components/character-sheet/AbilityScoresAndSkillsCard';
import DeathSavesCard from '@/components/character-sheet/DeathSavesCard';
import SkillsTab from '@/components/character-sheet/SkillsTab';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import useCharacterSheetData from '@/hooks/useCharacterSheetData';
import { isAbilityKey } from '@/lib/characterSheetUtils';

export default function CharacterSheetScreen() {
    const [activeTab, setActiveTab] = useState<CharacterSheetTab>('Core');
    const router = useRouter();
    const {
        character,
        loading,
        error,
        isUnauthenticated,
        handleToggleInspiration,
        handleUpdateDeathSaves,
    } = useCharacterSheetData();

    useEffect(() => {
        if (isUnauthenticated) router.replace('/(auth)/sign-in');
    }, [isUnauthenticated, router]);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={fantasyTokens.colors.gold} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.stateText}>Failed to load character.</Text>
                <Text style={styles.errorDetail}>{error.message}</Text>
            </View>
        );
    }

    if (!character || !character.stats) {
        return (
            <View style={styles.centered}>
                <Text style={styles.stateText}>No characters yet.</Text>
                <Text style={styles.stateSubtext}>
                    Create a character to get started.
                </Text>
            </View>
        );
    }

    const { stats } = character;
    const savingThrowProficiencies = stats.savingThrowProficiencies.filter(isAbilityKey);

    return (
        <View style={styles.container}>
            <CharacterSheetHeader
                name={character.name}
                level={character.level}
                className={character.class}
                subclass={character.subclass ?? undefined}
                race={character.race}
                alignment={character.alignment}
                activeTab={activeTab}
                onTabPress={setActiveTab}
            />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {activeTab === 'Core' && (
                    <>
                        <VitalsCard
                            hp={stats.hp}
                            ac={character.ac}
                            speed={character.speed}
                            conditions={character.conditions}
                        />
                        <QuickStatsCard
                            proficiencyBonus={character.proficiencyBonus}
                            initiative={character.initiative}
                            inspiration={character.inspiration}
                            spellSaveDC={character.spellSaveDC ?? null}
                            onToggleInspiration={handleToggleInspiration}
                        />
                        <AbilityScoresAndSkillsCard
                            abilityScores={stats.abilityScores}
                            proficiencyBonus={character.proficiencyBonus}
                            savingThrowProficiencies={savingThrowProficiencies}
                            skillProficiencies={stats.skillProficiencies}
                        />
                        <DeathSavesCard
                            successes={stats.deathSaves.successes}
                            failures={stats.deathSaves.failures}
                            onUpdate={handleUpdateDeathSaves}
                        />
                    </>
                )}

                {activeTab === 'Skills' && (
                    <SkillsTab
                        abilityScores={stats.abilityScores}
                        proficiencyBonus={character.proficiencyBonus}
                        skillProficiencies={stats.skillProficiencies}
                    />
                )}
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
        paddingBottom: fantasyTokens.spacing.xl * 2,
        gap: 12,
    },
    centered: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.night,
        justifyContent: 'center',
        alignItems: 'center',
        padding: fantasyTokens.spacing.lg,
    },
    stateText: {
        color: fantasyTokens.colors.parchment,
        fontFamily: 'serif',
        fontSize: 18,
        textAlign: 'center',
    },
    stateSubtext: {
        color: fantasyTokens.colors.inkSoft,
        fontFamily: 'serif',
        fontSize: 14,
        textAlign: 'center',
        marginTop: fantasyTokens.spacing.sm,
    },
    errorDetail: {
        color: fantasyTokens.colors.crimson,
        fontFamily: 'serif',
        fontSize: 13,
        textAlign: 'center',
        marginTop: fantasyTokens.spacing.sm,
    },
});
