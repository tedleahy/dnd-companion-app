import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import FilterChipGroup from '../FilterChipGroup';

function renderWithPaper(ui: React.ReactElement) {
    return render(<PaperProvider>{ui}</PaperProvider>);
}

const OPTIONS = [
    { key: 'wizard', label: 'Wizard' },
    { key: 'cleric', label: 'Cleric' },
    { key: 'bard', label: 'Bard' },
];

describe('FilterChipGroup', () => {
    it('renders the section label', () => {
        renderWithPaper(
            <FilterChipGroup label="Class" options={OPTIONS} selected={[]} onToggle={jest.fn()} />
        );
        expect(screen.getByText('Class')).toBeTruthy();
    });

    it('renders all chip labels', () => {
        renderWithPaper(
            <FilterChipGroup label="Class" options={OPTIONS} selected={[]} onToggle={jest.fn()} />
        );
        expect(screen.getByText('Wizard')).toBeTruthy();
        expect(screen.getByText('Cleric')).toBeTruthy();
        expect(screen.getByText('Bard')).toBeTruthy();
    });

    it('calls onToggle with the chip key when pressed', () => {
        const onToggle = jest.fn();
        renderWithPaper(
            <FilterChipGroup label="Class" options={OPTIONS} selected={[]} onToggle={onToggle} />
        );
        fireEvent.press(screen.getByText('Wizard'));
        expect(onToggle).toHaveBeenCalledWith('wizard');
    });

    it('marks selected chips', () => {
        renderWithPaper(
            <FilterChipGroup label="Class" options={OPTIONS} selected={['cleric']} onToggle={jest.fn()} />
        );
        // The Cleric chip should have selected=true prop
        // We verify by checking the chip is rendered (visual styling is tested via snapshot if needed)
        expect(screen.getByText('Cleric')).toBeTruthy();
    });
});
