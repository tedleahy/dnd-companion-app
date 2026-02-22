import { useCallback } from 'react';
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
    TOGGLE_INSPIRATION,
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

export default function useCharacterSheetData() {
    const { data, loading, error } = useQuery<CurrentUserCharactersQuery>(GET_CURRENT_USER_CHARACTERS);

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

    return {
        character,
        loading,
        error,
        isUnauthenticated: isUnauthenticatedError(error),
        handleToggleInspiration,
        handleUpdateDeathSaves,
        handleUpdateSkillProficiency,
    };
}
