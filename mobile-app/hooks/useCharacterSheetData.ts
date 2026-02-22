import { useCallback } from 'react';
import type { ApolloCache } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import type {
    CurrentUserCharactersQuery,
    ToggleInspirationMutation,
    ToggleInspirationMutationVariables,
    UpdateDeathSavesMutation,
    UpdateDeathSavesMutationVariables,
    ProficiencyLevel,
    SkillProficiencies,
    SkillProficienciesInput,
} from '@/types/generated_graphql_types';
import {
    GET_CURRENT_USER_CHARACTERS,
    PREPARE_SPELL,
    TOGGLE_INSPIRATION,
    TOGGLE_SPELL_SLOT,
    UNPREPARE_SPELL,
    UPDATE_DEATH_SAVES,
    UPDATE_SKILL_PROFICIENCIES,
} from '@/graphql/characterSheet.operations';
import { isUnauthenticatedError } from '@/lib/graphqlErrors';
import type { SkillKey } from '@/lib/characterSheetUtils';

type UpdateSkillProficienciesMutationData = {
    updateSkillProficiencies: {
        __typename: 'CharacterStats';
        id: string;
        skillProficiencies: SkillProficiencies;
    };
};

type UpdateSkillProficienciesMutationVariables = {
    characterId: string;
    input: SkillProficienciesInput;
};

type CharacterSpellSlot = {
    __typename?: 'SpellSlot';
    id: string;
    level: number;
    total: number;
    used: number;
};

type CharacterSpellbookEntry = {
    __typename?: 'CharacterSpell';
    prepared: boolean;
    spell: {
        __typename?: 'Spell';
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

type CharacterWithSpells = CurrentUserCharactersQuery['currentUserCharacters'][number] & {
    spellcastingAbility?: string | null;
    spellSaveDC?: number | null;
    spellAttackBonus?: number | null;
    spellSlots: CharacterSpellSlot[];
    spellbook: CharacterSpellbookEntry[];
};

type CurrentUserCharactersWithSpellsQuery = {
    currentUserCharacters: CharacterWithSpells[];
};

type ToggleSpellSlotMutationData = {
    toggleSpellSlot: CharacterSpellSlot;
};

type ToggleSpellSlotMutationVariables = {
    characterId: string;
    level: number;
};

type SpellPreparedMutationVariables = {
    characterId: string;
    spellId: string;
};

type PrepareSpellMutationData = {
    prepareSpell: {
        __typename: 'CharacterSpell';
        prepared: boolean;
        spell: {
            __typename: 'Spell';
            id: string;
        };
    };
};

type UnprepareSpellMutationData = {
    unprepareSpell: {
        __typename: 'CharacterSpell';
        prepared: boolean;
        spell: {
            __typename: 'Spell';
            id: string;
        };
    };
};

function updateSpellSlotInCache(
    cache: ApolloCache,
    characterId: string,
    level: number,
    used: number,
) {
    cache.updateQuery<CurrentUserCharactersWithSpellsQuery>(
        { query: GET_CURRENT_USER_CHARACTERS },
        (data: CurrentUserCharactersWithSpellsQuery | null) => {
            if (!data) return data;

            return {
                ...data,
                currentUserCharacters: data.currentUserCharacters.map((currentCharacter: CharacterWithSpells) => {
                    if (currentCharacter.id !== characterId) return currentCharacter;

                    return {
                        ...currentCharacter,
                        spellSlots: currentCharacter.spellSlots.map((slot: CharacterSpellSlot) => {
                            if (slot.level !== level) return slot;
                            return { ...slot, used };
                        }),
                    };
                }),
            };
        },
    );
}

function updateSpellPreparedInCache(
    cache: ApolloCache,
    characterId: string,
    spellId: string,
    prepared: boolean,
) {
    cache.updateQuery<CurrentUserCharactersWithSpellsQuery>(
        { query: GET_CURRENT_USER_CHARACTERS },
        (data: CurrentUserCharactersWithSpellsQuery | null) => {
            if (!data) return data;

            return {
                ...data,
                currentUserCharacters: data.currentUserCharacters.map((currentCharacter: CharacterWithSpells) => {
                    if (currentCharacter.id !== characterId) return currentCharacter;

                    return {
                        ...currentCharacter,
                        spellbook: currentCharacter.spellbook.map((entry: CharacterSpellbookEntry) => {
                            if (entry.spell.id !== spellId) return entry;
                            return { ...entry, prepared };
                        }),
                    };
                }),
            };
        },
    );
}

export default function useCharacterSheetData() {
    const { data, loading, error } = useQuery<CurrentUserCharactersWithSpellsQuery>(
        GET_CURRENT_USER_CHARACTERS,
    );

    const [toggleInspiration] = useMutation<
        ToggleInspirationMutation,
        ToggleInspirationMutationVariables
    >(TOGGLE_INSPIRATION);

    const [updateDeathSaves] = useMutation<
        UpdateDeathSavesMutation,
        UpdateDeathSavesMutationVariables
    >(UPDATE_DEATH_SAVES);

    const [updateSkillProficiencies] = useMutation<
        UpdateSkillProficienciesMutationData,
        UpdateSkillProficienciesMutationVariables
    >(UPDATE_SKILL_PROFICIENCIES);

    const [toggleSpellSlot] = useMutation<
        ToggleSpellSlotMutationData,
        ToggleSpellSlotMutationVariables
    >(TOGGLE_SPELL_SLOT);

    const [prepareSpell] = useMutation<
        PrepareSpellMutationData,
        SpellPreparedMutationVariables
    >(PREPARE_SPELL);

    const [unprepareSpell] = useMutation<
        UnprepareSpellMutationData,
        SpellPreparedMutationVariables
    >(UNPREPARE_SPELL);

    const character = data?.currentUserCharacters?.[0] ?? null;

    const handleToggleInspiration = useCallback(() => {
        if (!character) return;

        toggleInspiration({
            variables: { characterId: character.id },
            optimisticResponse: {
                toggleInspiration: {
                    __typename: 'Character',
                    id: character.id,
                    inspiration: !character.inspiration,
                },
            },
        });
    }, [character, toggleInspiration]);

    const handleUpdateDeathSaves = useCallback((successes: number, failures: number) => {
        if (!character || !character.stats) return;

        updateDeathSaves({
            variables: {
                characterId: character.id,
                input: { successes, failures },
            },
            optimisticResponse: {
                updateDeathSaves: {
                    __typename: 'CharacterStats',
                    id: character.stats.id,
                    deathSaves: {
                        __typename: 'DeathSaves',
                        successes,
                        failures,
                    },
                },
            },
        });
    }, [character, updateDeathSaves]);

    const handleUpdateSkillProficiency = useCallback(async (
        skillKey: SkillKey,
        level: ProficiencyLevel,
        nextSkillProficiencies: SkillProficienciesInput,
    ) => {
        if (!character || !character.stats) return;

        try {
            await updateSkillProficiencies({
                variables: {
                    characterId: character.id,
                    input: nextSkillProficiencies,
                },
                optimisticResponse: {
                    updateSkillProficiencies: {
                        __typename: 'CharacterStats',
                        id: character.stats.id,
                        skillProficiencies: {
                            __typename: 'SkillProficiencies',
                            ...character.stats.skillProficiencies,
                            [skillKey]: level,
                        },
                    },
                },
            });
        } catch (error) {
            console.error('Failed to update skill proficiency', { skillKey, level, error });
            throw error;
        }
    }, [character, updateSkillProficiencies]);

    const handleToggleSpellSlot = useCallback(async (level: number) => {
        if (!character) return;

        const slot = character.spellSlots.find((spellSlot) => spellSlot.level === level);
        if (!slot) return;

        const nextUsed = slot.used < slot.total ? slot.used + 1 : 0;

        try {
            await toggleSpellSlot({
                variables: {
                    characterId: character.id,
                    level,
                },
                optimisticResponse: {
                    toggleSpellSlot: {
                        __typename: 'SpellSlot',
                        id: slot.id,
                        level: slot.level,
                        total: slot.total,
                        used: nextUsed,
                    },
                },
                update(cache) {
                    updateSpellSlotInCache(cache, character.id, level, nextUsed);
                },
            });
        } catch (error) {
            console.error('Failed to toggle spell slot', { level, error });
            throw error;
        }
    }, [character, toggleSpellSlot]);

    const handleSetSpellPrepared = useCallback(async (spellId: string, prepared: boolean) => {
        if (!character) return;

        try {
            if (prepared) {
                await prepareSpell({
                    variables: {
                        characterId: character.id,
                        spellId,
                    },
                    optimisticResponse: {
                        prepareSpell: {
                            __typename: 'CharacterSpell',
                            prepared: true,
                            spell: {
                                __typename: 'Spell',
                                id: spellId,
                            },
                        },
                    },
                    update(cache) {
                        updateSpellPreparedInCache(cache, character.id, spellId, true);
                    },
                });

                return;
            }

            await unprepareSpell({
                variables: {
                    characterId: character.id,
                    spellId,
                },
                optimisticResponse: {
                    unprepareSpell: {
                        __typename: 'CharacterSpell',
                        prepared: false,
                        spell: {
                            __typename: 'Spell',
                            id: spellId,
                        },
                    },
                },
                update(cache) {
                    updateSpellPreparedInCache(cache, character.id, spellId, false);
                },
            });
        } catch (error) {
            console.error('Failed to update prepared state', { spellId, prepared, error });
            throw error;
        }
    }, [character, prepareSpell, unprepareSpell]);

    return {
        character,
        loading,
        error,
        isUnauthenticated: isUnauthenticatedError(error),
        handleToggleInspiration,
        handleUpdateDeathSaves,
        handleUpdateSkillProficiency,
        handleToggleSpellSlot,
        handleSetSpellPrepared,
    };
}
