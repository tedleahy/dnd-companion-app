import { useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import type {
    CurrentUserCharactersQuery,
    ToggleInspirationMutation,
    ToggleInspirationMutationVariables,
    UpdateDeathSavesMutation,
    UpdateDeathSavesMutationVariables,
} from '@/types/generated_graphql_types';
import {
    GET_CURRENT_USER_CHARACTERS,
    TOGGLE_INSPIRATION,
    UPDATE_DEATH_SAVES,
} from '@/graphql/characterSheet.operations';
import { isUnauthenticatedError } from '@/lib/graphqlErrors';

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

    return {
        character,
        loading,
        error,
        isUnauthenticated: isUnauthenticatedError(error),
        handleToggleInspiration,
        handleUpdateDeathSaves,
    };
}
