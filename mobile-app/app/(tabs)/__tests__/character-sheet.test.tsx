import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { MockedProvider } from '@apollo/client/testing/react';
import type { MockLink } from '@apollo/client/testing';
import { ProficiencyLevel } from '@/types/generated_graphql_types';
import { fantasyTokens } from '@/theme/fantasyTheme';
import {
    GET_CURRENT_USER_CHARACTERS,
    TOGGLE_INSPIRATION,
    UPDATE_DEATH_SAVES,
    UPDATE_SKILL_PROFICIENCIES,
} from '@/graphql/characterSheet.operations';
import CharacterSheetScreen from '../character-sheet';

const MOCK_CHARACTER = {
    __typename: 'Character',
    id: 'char-1',
    name: 'Vaelindra',
    race: 'High Elf',
    class: 'Wizard',
    subclass: 'School of Evocation',
    level: 12,
    alignment: 'Chaotic Good',
    proficiencyBonus: 4,
    inspiration: false,
    ac: 17,
    speed: 35,
    initiative: 3,
    spellSaveDC: 17,
    conditions: [] as string[],
    stats: {
        __typename: 'CharacterStats',
        id: 'stats-1',
        abilityScores: {
            __typename: 'AbilityScores',
            strength: 8,
            dexterity: 16,
            constitution: 14,
            intelligence: 20,
            wisdom: 13,
            charisma: 11,
        },
        hp: {
            __typename: 'HP',
            current: 54,
            max: 76,
            temp: 2,
        },
        deathSaves: {
            __typename: 'DeathSaves',
            successes: 1,
            failures: 0,
        },
        hitDice: {
            __typename: 'HitDice',
            total: 12,
            remaining: 12,
            die: 'd6',
        },
        savingThrowProficiencies: ['intelligence', 'wisdom'],
        skillProficiencies: {
            __typename: 'SkillProficiencies',
            acrobatics: ProficiencyLevel.None,
            animalHandling: ProficiencyLevel.None,
            arcana: ProficiencyLevel.Expert,
            athletics: ProficiencyLevel.None,
            deception: ProficiencyLevel.None,
            history: ProficiencyLevel.Expert,
            insight: ProficiencyLevel.Proficient,
            intimidation: ProficiencyLevel.None,
            investigation: ProficiencyLevel.Expert,
            medicine: ProficiencyLevel.None,
            nature: ProficiencyLevel.Proficient,
            perception: ProficiencyLevel.Proficient,
            performance: ProficiencyLevel.None,
            persuasion: ProficiencyLevel.None,
            religion: ProficiencyLevel.Proficient,
            sleightOfHand: ProficiencyLevel.None,
            stealth: ProficiencyLevel.Proficient,
            survival: ProficiencyLevel.None,
        },
    },
};

const { __typename: _skillTypeName, ...INITIAL_SKILL_INPUT } = MOCK_CHARACTER.stats.skillProficiencies;

const CHARACTERS_MOCK: MockLink.MockedResponse = {
    request: { query: GET_CURRENT_USER_CHARACTERS },
    result: {
        data: {
            currentUserCharacters: [MOCK_CHARACTER],
        },
    },
};

const EMPTY_MOCK: MockLink.MockedResponse = {
    request: { query: GET_CURRENT_USER_CHARACTERS },
    result: {
        data: {
            currentUserCharacters: [],
        },
    },
};

const ERROR_MOCK: MockLink.MockedResponse = {
    request: { query: GET_CURRENT_USER_CHARACTERS },
    error: new Error('Network error'),
};

const TOGGLE_MOCK: MockLink.MockedResponse = {
    request: {
        query: TOGGLE_INSPIRATION,
        variables: { characterId: 'char-1' },
    },
    result: {
        data: {
            toggleInspiration: {
                __typename: 'Character',
                id: 'char-1',
                inspiration: true,
            },
        },
    },
};

const UPDATE_DEATH_SAVES_MOCK: MockLink.MockedResponse = {
    request: {
        query: UPDATE_DEATH_SAVES,
        variables: {
            characterId: 'char-1',
            input: { successes: 2, failures: 0 },
        },
    },
    result: {
        data: {
            updateDeathSaves: {
                __typename: 'CharacterStats',
                id: 'stats-1',
                deathSaves: {
                    __typename: 'DeathSaves',
                    successes: 2,
                    failures: 0,
                },
            },
        },
    },
};

const UPDATE_SKILLS_MOCK: MockLink.MockedResponse = {
    request: {
        query: UPDATE_SKILL_PROFICIENCIES,
        variables: {
            characterId: 'char-1',
            input: {
                ...INITIAL_SKILL_INPUT,
                perception: ProficiencyLevel.Expert,
            },
        },
    },
    result: {
        data: {
            updateSkillProficiencies: {
                __typename: 'CharacterStats',
                id: 'stats-1',
                skillProficiencies: {
                    ...MOCK_CHARACTER.stats.skillProficiencies,
                    perception: ProficiencyLevel.Expert,
                },
            },
        },
    },
};

function renderScreen(mocks: MockLink.MockedResponse[] = [CHARACTERS_MOCK]) {
    return render(
        <MockedProvider mocks={mocks}>
            <PaperProvider>
                <CharacterSheetScreen />
            </PaperProvider>
        </MockedProvider>
    );
}

describe('CharacterSheetScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows a loading indicator initially', () => {
        renderScreen();
        expect(screen.getByRole('progressbar')).toBeTruthy();
    });

    it('renders character name after loading', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('Vaelindra')).toBeTruthy();
        });
    });

    it('renders the subtitle with level/class/race', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText(/Level 12 Wizard/)).toBeTruthy();
        });
    });

    it('renders vitals (HP, AC, Speed)', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('Hit Points')).toBeTruthy();
        });
        expect(screen.getByText('Armour Class')).toBeTruthy();
        expect(screen.getByText('Speed')).toBeTruthy();
    });

    it('renders abilities and skills section', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('Abilities & Skills')).toBeTruthy();
        });
    });

    it('renders saving throws rows', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getAllByText('Saving Throw').length).toBe(6);
        });
    });

    it('renders skill rows', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('Arcana')).toBeTruthy();
        });
    });

    it('renders death saves section', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('Death Saves')).toBeTruthy();
        });
    });

    it('shows empty state when no characters exist', async () => {
        renderScreen([EMPTY_MOCK]);
        await waitFor(() => {
            expect(screen.getByText('No characters yet.')).toBeTruthy();
        });
    });

    it('shows error state on network error', async () => {
        renderScreen([ERROR_MOCK]);
        await waitFor(() => {
            expect(screen.getByText('Failed to load character.')).toBeTruthy();
        });
    });

    it('renders the inspiration toggle button', async () => {
        renderScreen([CHARACTERS_MOCK, TOGGLE_MOCK]);
        await waitFor(() => {
            expect(screen.getByLabelText('Toggle inspiration')).toBeTruthy();
        });
    });

    it('optimistically updates inspiration label when tapped', async () => {
        renderScreen([CHARACTERS_MOCK, TOGGLE_MOCK]);
        await waitFor(() => {
            expect(screen.getByLabelText('Toggle inspiration')).toBeTruthy();
        });

        fireEvent.press(screen.getByLabelText('Toggle inspiration'));
        await waitFor(() => {
            expect(screen.getByText('Inspired')).toBeTruthy();
        });
    });

    it('renders death save circles', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByLabelText('Death save success 1')).toBeTruthy();
        });
        expect(screen.getByLabelText('Death save failure 1')).toBeTruthy();
    });

    it('optimistically fills success circles when toggled', async () => {
        renderScreen([CHARACTERS_MOCK, UPDATE_DEATH_SAVES_MOCK]);

        await waitFor(() => {
            expect(screen.getByLabelText('Death save success 2')).toBeTruthy();
        });

        const secondCircleBefore = screen.getByTestId('death-save-success-circle-2');
        expect(secondCircleBefore).toHaveStyle({ borderColor: fantasyTokens.colors.divider });

        fireEvent.press(screen.getByLabelText('Death save success 2'));

        await waitFor(() => {
            const secondCircleAfter = screen.getByTestId('death-save-success-circle-2');
            expect(secondCircleAfter).toHaveStyle({
                backgroundColor: fantasyTokens.colors.greenDark,
                borderColor: fantasyTokens.colors.greenDark,
            });
        });
    });

    it('renders temp HP when present', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('+2 temp')).toBeTruthy();
        });
    });

    it('renders "No conditions" when conditions array is empty', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('No conditions')).toBeTruthy();
        });
    });

    it('renders the tab bar with Core active', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('Core')).toBeTruthy();
        });
        expect(screen.getByText('Skills')).toBeTruthy();
        expect(screen.getByText('Spells')).toBeTruthy();
        expect(screen.getByText('Gear')).toBeTruthy();
        expect(screen.getByText('Features')).toBeTruthy();
    });

    it('switches to the Skills tab', async () => {
        renderScreen();

        await waitFor(() => {
            expect(screen.getByLabelText('Open Skills tab')).toBeTruthy();
        });

        fireEvent.press(screen.getByLabelText('Open Skills tab'));

        await waitFor(() => {
            expect(screen.getByText('Passive Senses')).toBeTruthy();
        });
        expect(screen.queryByText('Abilities & Skills')).toBeNull();
    });

    it('cycles skill proficiency and recalculates passive score', async () => {
        renderScreen([CHARACTERS_MOCK, UPDATE_SKILLS_MOCK]);

        await waitFor(() => {
            expect(screen.getByLabelText('Open Skills tab')).toBeTruthy();
        });
        fireEvent.press(screen.getByLabelText('Open Skills tab'));

        await waitFor(() => {
            expect(screen.getByTestId('passive-perception-value')).toHaveTextContent('15');
        });

        fireEvent.changeText(screen.getByLabelText('Search skills'), 'Perception');

        await waitFor(() => {
            expect(screen.getByLabelText('Cycle proficiency for Perception')).toBeTruthy();
        });

        fireEvent.press(screen.getByLabelText('Cycle proficiency for Perception'));

        await waitFor(() => {
            expect(screen.getByTestId('passive-perception-value')).toHaveTextContent('19');
        });
    });

    it('filters skills by search text', async () => {
        renderScreen();

        await waitFor(() => {
            expect(screen.getByLabelText('Open Skills tab')).toBeTruthy();
        });
        fireEvent.press(screen.getByLabelText('Open Skills tab'));

        await waitFor(() => {
            expect(screen.getByLabelText('Search skills')).toBeTruthy();
        });
        fireEvent.changeText(screen.getByLabelText('Search skills'), 'Arcana');

        await waitFor(() => {
            expect(screen.getByText('Arcana')).toBeTruthy();
        });
        expect(screen.queryByText('Athletics')).toBeNull();
    });
});
