import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import SignUp from '../sign-up';
import { supabase } from '@/lib/supabase';

const mockReplace = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
    useRouter: () => ({ push: jest.fn(), replace: mockReplace, back: mockBack }),
}));

function renderScreen() {
    return render(
        <PaperProvider>
            <SignUp />
        </PaperProvider>
    );
}

describe('SignUp', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the sign-up form', () => {
        renderScreen();
        expect(screen.getByText('Sign up')).toBeTruthy();
        expect(screen.getByText('Create Your Account')).toBeTruthy();
    });

    it('renders email, password, and confirm password fields', () => {
        renderScreen();
        expect(screen.getAllByText('Email').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Password').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Confirm Password').length).toBeGreaterThan(0);
    });

    it('shows password mismatch message', () => {
        renderScreen();
        const inputs = screen.getAllByDisplayValue('');
        // inputs[0] = email, inputs[1] = password, inputs[2] = confirm password
        fireEvent.changeText(inputs[1], 'password123');
        fireEvent.changeText(inputs[2], 'different');
        expect(screen.getByText('Passwords do not match yet.')).toBeTruthy();
    });

    it('shows password match message', () => {
        renderScreen();
        const inputs = screen.getAllByDisplayValue('');
        fireEvent.changeText(inputs[1], 'password123');
        fireEvent.changeText(inputs[2], 'password123');
        expect(screen.getByText('Passwords match!')).toBeTruthy();
    });

    it('navigates back when "I already have an account" is pressed', () => {
        renderScreen();
        fireEvent.press(screen.getByText('I already have an account'));
        expect(mockBack).toHaveBeenCalled();
    });

    it('redirects to home on successful sign-up', async () => {
        (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({ data: {}, error: null });
        (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
            data: { session: { access_token: 'token123' } },
        });

        renderScreen();

        const inputs = screen.getAllByDisplayValue('');
        fireEvent.changeText(inputs[0], 'test@example.com');
        fireEvent.changeText(inputs[1], 'password123');
        fireEvent.changeText(inputs[2], 'password123');

        fireEvent.press(screen.getByText('Create Account'));

        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith('/');
        });
    });
});
