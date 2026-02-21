import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { MockedProvider } from '@apollo/client/testing/react';
import type { MockLink } from '@apollo/client/testing';
import { gql } from '@apollo/client';
import SpellListDetail from '../[id]';

const mockBack = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
    useRouter: () => ({ push: mockPush, replace: jest.fn(), back: mockBack }),
    useLocalSearchParams: () => ({ id: 'list-1' }),
}));

const GET_SPELL_LIST = gql`
    query SpellList {
        currentUserSpellLists {
            id
            name
            spells {
                id
                name
            }
        }
    }
`;

const LIST_WITH_SPELLS_MOCK: MockLink.MockedResponse = {
    request: { query: GET_SPELL_LIST },
    result: {
        data: {
            currentUserSpellLists: [
                {
                    __typename: 'SpellList',
                    id: 'list-1',
                    name: 'My Wizard Spells',
                    spells: [
                        { __typename: 'Spell', id: 's1', name: 'Fireball' },
                        { __typename: 'Spell', id: 's2', name: 'Shield' },
                    ],
                },
            ],
        },
    },
};

const EMPTY_LIST_MOCK: MockLink.MockedResponse = {
    request: { query: GET_SPELL_LIST },
    result: {
        data: {
            currentUserSpellLists: [
                {
                    __typename: 'SpellList',
                    id: 'list-1',
                    name: 'Empty List',
                    spells: [],
                },
            ],
        },
    },
};

const NOT_FOUND_MOCK: MockLink.MockedResponse = {
    request: { query: GET_SPELL_LIST },
    result: {
        data: {
            currentUserSpellLists: [],
        },
    },
};

function renderScreen(mocks: MockLink.MockedResponse[] = [LIST_WITH_SPELLS_MOCK]) {
    return render(
        <MockedProvider mocks={mocks}>
            <PaperProvider>
                <SpellListDetail />
            </PaperProvider>
        </MockedProvider>
    );
}

describe('SpellListDetail screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows a loading indicator initially', () => {
        renderScreen();
        expect(screen.getByRole('progressbar')).toBeTruthy();
    });

    it('renders the list name after loading', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('My Wizard Spells')).toBeTruthy();
        });
    });

    it('renders spells in the list', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('Fireball')).toBeTruthy();
        });
        expect(screen.getByText('Shield')).toBeTruthy();
    });

    it('shows empty state when list has no spells', async () => {
        renderScreen([EMPTY_LIST_MOCK]);
        await waitFor(() => {
            expect(screen.getByText(/No spells in this list yet/)).toBeTruthy();
        });
    });

    it('shows "Spell list not found" when list does not exist', async () => {
        renderScreen([NOT_FOUND_MOCK]);
        await waitFor(() => {
            expect(screen.getByText('Spell list not found.')).toBeTruthy();
        });
    });

    it('navigates back when back button is pressed', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('My Wizard Spells')).toBeTruthy();
        });
        // The back button is an IconButton with icon="arrow-left"
        // Find it by its accessibility role
        const backButtons = screen.getAllByRole('button');
        fireEvent.press(backButtons[0]);
        expect(mockBack).toHaveBeenCalled();
    });
});
