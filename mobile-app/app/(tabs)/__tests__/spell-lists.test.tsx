import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { MockedProvider } from '@apollo/client/testing/react';
import type { MockLink } from '@apollo/client/testing';
import { gql } from '@apollo/client';
import SpellListsScreen from '../spell-lists';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
    useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
}));

const GET_SPELL_LISTS = gql`
    query CurrentUserSpellLists {
        currentUserSpellLists {
            id
            name
        }
    }
`;

const CREATE_SPELL_LIST = gql`
    mutation CreateSpellList($name: String!) {
        createSpellList(name: $name) {
            id
            name
        }
    }
`;

const LISTS_MOCK: MockLink.MockedResponse = {
    request: { query: GET_SPELL_LISTS },
    result: {
        data: {
            currentUserSpellLists: [
                { __typename: 'SpellList', id: '1', name: 'My Wizard Spells' },
                { __typename: 'SpellList', id: '2', name: 'Cleric Heals' },
            ],
        },
    },
};

const EMPTY_LISTS_MOCK: MockLink.MockedResponse = {
    request: { query: GET_SPELL_LISTS },
    result: { data: { currentUserSpellLists: [] } },
};

function renderScreen(mocks: MockLink.MockedResponse[] = [LISTS_MOCK]) {
    return render(
        <MockedProvider mocks={mocks}>
            <PaperProvider>
                <SpellListsScreen />
            </PaperProvider>
        </MockedProvider>
    );
}

describe('SpellListsScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows a loading indicator initially', () => {
        renderScreen();
        expect(screen.getByRole('progressbar')).toBeTruthy();
    });

    it('renders spell list names after loading', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('My Wizard Spells')).toBeTruthy();
        });
        expect(screen.getByText('Cleric Heals')).toBeTruthy();
    });

    it('shows empty state when no lists exist', async () => {
        renderScreen([EMPTY_LISTS_MOCK]);
        await waitFor(() => {
            expect(screen.getByText('No spell lists yet. Tap + to create one.')).toBeTruthy();
        });
    });

    it('navigates to spell list detail on press', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('My Wizard Spells')).toBeTruthy();
        });
        fireEvent.press(screen.getByText('My Wizard Spells'));
        expect(mockPush).toHaveBeenCalledWith('/spell-lists/1');
    });

    it('renders the heading', () => {
        renderScreen();
        expect(screen.getByText('Spell Lists')).toBeTruthy();
    });
});
