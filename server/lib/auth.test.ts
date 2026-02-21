import { describe, expect, test } from 'bun:test';
import { requireUser } from './auth';

describe('requireUser', () => {
    test('returns userId when present', () => {
        const ctx = { userId: 'user-123' };
        expect(requireUser(ctx)).toBe('user-123');
    });

    test('throws UNAUTHENTICATED when userId is null', () => {
        const ctx = { userId: null };
        expect(() => requireUser(ctx)).toThrow('UNAUTHENTICATED');
    });
});
