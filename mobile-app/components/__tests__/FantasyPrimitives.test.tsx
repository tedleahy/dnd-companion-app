import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { Text } from 'react-native';
import { ParchmentPanel, RuneDivider, DetailRow } from '../FantasyPrimitives';

function renderWithPaper(ui: React.ReactElement) {
    return render(<PaperProvider>{ui}</PaperProvider>);
}

describe('ParchmentPanel', () => {
    it('renders children', () => {
        renderWithPaper(
            <ParchmentPanel>
                <Text>Hello Panel</Text>
            </ParchmentPanel>
        );
        expect(screen.getByText('Hello Panel')).toBeTruthy();
    });
});

describe('RuneDivider', () => {
    it('renders the rune characters', () => {
        renderWithPaper(<RuneDivider />);
        expect(screen.getByText('✶ ✧ ✶')).toBeTruthy();
    });
});

describe('DetailRow', () => {
    it('renders label and value', () => {
        renderWithPaper(<DetailRow label="Casting Time" value="1 Action" />);
        expect(screen.getByText('Casting Time')).toBeTruthy();
        expect(screen.getByText('1 Action')).toBeTruthy();
    });
});
