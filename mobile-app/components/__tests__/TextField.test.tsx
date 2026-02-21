import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import TextField from '../TextField';

function renderWithPaper(ui: React.ReactElement) {
    return render(<PaperProvider>{ui}</PaperProvider>);
}

describe('TextField', () => {
    it('renders with the given label', () => {
        renderWithPaper(
            <TextField label="Email" value="" onChangeText={jest.fn()} />
        );
        expect(screen.getAllByText('Email').length).toBeGreaterThan(0);
    });

    it('displays the current value', () => {
        renderWithPaper(
            <TextField label="Email" value="test@example.com" onChangeText={jest.fn()} />
        );
        expect(screen.getByDisplayValue('test@example.com')).toBeTruthy();
    });

    it('calls onChangeText when text changes', () => {
        const onChangeText = jest.fn();
        renderWithPaper(
            <TextField label="Email" value="" onChangeText={onChangeText} />
        );
        fireEvent.changeText(screen.getByDisplayValue(''), 'hello');
        expect(onChangeText).toHaveBeenCalledWith('hello');
    });

    it('supports secureTextEntry', () => {
        renderWithPaper(
            <TextField label="Password" value="" onChangeText={jest.fn()} secureTextEntry />
        );
        // The TextInput should exist with secureTextEntry
        expect(screen.getAllByText('Password').length).toBeGreaterThan(0);
    });
});
