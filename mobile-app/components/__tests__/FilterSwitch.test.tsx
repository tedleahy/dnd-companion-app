import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import FilterSwitch from '../FilterSwitch';

function renderWithPaper(ui: React.ReactElement) {
    return render(<PaperProvider>{ui}</PaperProvider>);
}

describe('FilterSwitch', () => {
    it('renders the label', () => {
        renderWithPaper(
            <FilterSwitch label="Ritual only" value={false} onToggle={jest.fn()} />
        );
        expect(screen.getByText('Ritual only')).toBeTruthy();
    });

    it('calls onToggle when the switch is toggled', () => {
        const onToggle = jest.fn();
        renderWithPaper(
            <FilterSwitch label="Ritual only" value={false} onToggle={onToggle} />
        );
        fireEvent(screen.getByRole('switch'), 'valueChange', true);
        expect(onToggle).toHaveBeenCalled();
    });

    it('reflects the value prop on the switch', () => {
        renderWithPaper(
            <FilterSwitch label="Ritual only" value={true} onToggle={jest.fn()} />
        );
        const switchEl = screen.getByRole('switch');
        expect(switchEl.props.value).toBe(true);
    });
});
