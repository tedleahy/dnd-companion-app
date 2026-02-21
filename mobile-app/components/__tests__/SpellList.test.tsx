import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import SpellList from '../SpellList';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
    useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
}));

function renderWithPaper(ui: React.ReactElement) {
    return render(<PaperProvider>{ui}</PaperProvider>);
}

const SPELLS = [
    { id: '1', name: 'Fireball' },
    { id: '2', name: 'Magic Missile' },
    { id: '3', name: 'Shield' },
];

describe('SpellList', () => {
    beforeEach(() => {
        mockPush.mockClear();
    });

    it('shows a loading indicator when loading', () => {
        renderWithPaper(<SpellList spells={[]} loading={true} />);
        expect(screen.getByRole('progressbar')).toBeTruthy();
    });

    it('renders spell names when not loading', () => {
        renderWithPaper(<SpellList spells={SPELLS} loading={false} />);
        expect(screen.getByText('Fireball')).toBeTruthy();
        expect(screen.getByText('Magic Missile')).toBeTruthy();
        expect(screen.getByText('Shield')).toBeTruthy();
    });

    it('navigates to spell detail on press', () => {
        renderWithPaper(<SpellList spells={SPELLS} loading={false} />);
        fireEvent.press(screen.getByText('Fireball'));
        expect(mockPush).toHaveBeenCalledWith('/spells/1');
    });

    it('renders an empty list when spells is undefined', () => {
        renderWithPaper(<SpellList spells={undefined} loading={false} />);
        expect(screen.queryByText('Fireball')).toBeNull();
    });
});
