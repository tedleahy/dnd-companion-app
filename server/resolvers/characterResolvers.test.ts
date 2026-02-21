import { describe, expect, test, mock, beforeEach } from 'bun:test';

// ---------------------------------------------------------------------------
// Mock Prisma and auth, same pattern as spellsResolver.test.ts.
//
// We create individual mocks for each Prisma model method the resolvers use,
// then wire them into a fake prisma object that mock.module() returns.
// ---------------------------------------------------------------------------

// character model mocks
const characterFindFirstMock = mock((_args: unknown) => Promise.resolve(null));
const characterFindManyMock = mock((_args: unknown) => Promise.resolve([]));
const characterCreateMock = mock((_args: unknown) => Promise.resolve({}));
const characterUpdateMock = mock((_args: unknown) => Promise.resolve({}));
const characterDeleteManyMock = mock((_args: unknown) => Promise.resolve({ count: 1 }));

// characterStats model mocks
const statsFindUniqueMock = mock((_args: unknown) => Promise.resolve(null));
const statsUpdateMock = mock((_args: unknown) => Promise.resolve({}));

// field resolver model mocks
const attackFindManyMock = mock((_args: unknown) => Promise.resolve([]));
const inventoryItemFindManyMock = mock((_args: unknown) => Promise.resolve([]));
const characterFeatureFindManyMock = mock((_args: unknown) => Promise.resolve([]));
const spellSlotFindManyMock = mock((_args: unknown) => Promise.resolve([]));
const preparedSpellFindManyMock = mock((_args: unknown) => Promise.resolve([]));

mock.module('../prisma/prisma', () => ({
    default: {
        character: {
            findFirst: characterFindFirstMock,
            findMany: characterFindManyMock,
            create: characterCreateMock,
            update: characterUpdateMock,
            deleteMany: characterDeleteManyMock,
        },
        characterStats: {
            findUnique: statsFindUniqueMock,
            update: statsUpdateMock,
        },
        attack: { findMany: attackFindManyMock },
        inventoryItem: { findMany: inventoryItemFindManyMock },
        characterFeature: { findMany: characterFeatureFindManyMock },
        spellSlot: { findMany: spellSlotFindManyMock },
        characterPreparedSpell: { findMany: preparedSpellFindManyMock },
    },
}));

mock.module('../lib/auth', () => ({
    requireUser(ctx: { userId: string | null }): string {
        if (!ctx.userId) throw new Error('UNAUTHENTICATED');
        return ctx.userId;
    },
}));

const resolvers = await import('./characterResolvers');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const authedCtx = { userId: 'user-abc' };
const unauthedCtx = { userId: null };

const fakeCharacter = {
    id: 'char-1',
    ownerUserId: 'user-abc',
    name: 'Vaelindra',
    inspiration: false,
};

const fakeStats = {
    id: 'stats-1',
    characterId: 'char-1',
    abilityScores: { strength: 8, dexterity: 16, constitution: 14, intelligence: 20, wisdom: 13, charisma: 11 },
    hp: { current: 54, max: 76, temp: 2 },
    deathSaves: { successes: 0, failures: 0 },
    hitDice: { total: 12, remaining: 12, die: 'd6' },
    savingThrowProficiencies: ['constitution', 'intelligence'],
    skillProficiencies: { arcana: 'expert', history: 'proficient', stealth: 'none' },
    traits: { personality: 'Curious', ideals: 'Knowledge', bonds: 'Spellbook', flaws: 'Arrogant' },
    currency: { cp: 0, sp: 14, ep: 0, gp: 847, pp: 3 },
};

function clearAllMocks() {
    characterFindFirstMock.mockClear();
    characterFindManyMock.mockClear();
    characterCreateMock.mockClear();
    characterUpdateMock.mockClear();
    characterDeleteManyMock.mockClear();
    statsFindUniqueMock.mockClear();
    statsUpdateMock.mockClear();
    attackFindManyMock.mockClear();
    inventoryItemFindManyMock.mockClear();
    characterFeatureFindManyMock.mockClear();
    spellSlotFindManyMock.mockClear();
    preparedSpellFindManyMock.mockClear();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('characterResolvers — queries', () => {
    beforeEach(clearAllMocks);

    test('character throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.character({}, { id: 'char-1' }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
        expect(characterFindFirstMock).not.toHaveBeenCalled();
    });

    test('character calls findFirst with id + ownerUserId', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);

        const result = await resolvers.character({}, { id: 'char-1' }, authedCtx);

        expect(characterFindFirstMock).toHaveBeenCalledTimes(1);
        const args = characterFindFirstMock.mock.calls[0]![0] as Record<string, unknown>;
        expect(args.where).toEqual({ id: 'char-1', ownerUserId: 'user-abc' });
        expect(result).toEqual(fakeCharacter);
    });

    test('currentUserCharacters throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.currentUserCharacters({}, {}, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('currentUserCharacters calls findMany with ownerUserId', async () => {
        characterFindManyMock.mockResolvedValueOnce([fakeCharacter]);

        const result = await resolvers.currentUserCharacters({}, {}, authedCtx);

        expect(characterFindManyMock).toHaveBeenCalledTimes(1);
        const args = characterFindManyMock.mock.calls[0]![0] as Record<string, unknown>;
        expect(args.where).toEqual({ ownerUserId: 'user-abc' });
        expect(result).toEqual([fakeCharacter]);
    });
});

describe('characterResolvers — createCharacter', () => {
    beforeEach(clearAllMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.createCharacter({}, { input: {} as any }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('creates character with stats in a nested create', async () => {
        const createdChar = { id: 'char-new', ownerUserId: 'user-abc' };
        characterCreateMock.mockResolvedValueOnce(createdChar);

        const input = {
            name: 'Vaelindra',
            race: 'High Elf',
            class: 'Wizard',
            level: 12,
            alignment: 'Chaotic Good',
            background: 'Sage',
            proficiencyBonus: 4,
            ac: 17,
            speed: 35,
            initiative: 7,
            abilityScores: { strength: 8, dexterity: 16, constitution: 14, intelligence: 20, wisdom: 13, charisma: 11 },
            hp: { current: 76, max: 76, temp: 0 },
            hitDice: { total: 12, remaining: 12, die: 'd6' },
            skillProficiencies: { arcana: 'expert' },
        };

        const result = await resolvers.createCharacter({}, { input: input as any }, authedCtx);

        expect(characterCreateMock).toHaveBeenCalledTimes(1);
        const callArgs = characterCreateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.ownerUserId).toBe('user-abc');
        expect(callArgs.data.name).toBe('Vaelindra');
        // Stats should be nested under create
        expect(callArgs.data.stats.create.abilityScores).toEqual(input.abilityScores);
        expect(callArgs.data.stats.create.hp).toEqual(input.hp);
        expect(callArgs.data.stats.create.deathSaves).toEqual({ successes: 0, failures: 0 });
        expect(result).toEqual(createdChar);
    });
});

describe('characterResolvers — updateCharacter', () => {
    beforeEach(clearAllMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.updateCharacter({}, { id: 'char-1', input: {} }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('throws when character not found', () => {
        characterFindFirstMock.mockResolvedValueOnce(null);

        expect(resolvers.updateCharacter({}, { id: 'char-1', input: { name: 'New' } }, authedCtx))
            .rejects.toThrow('Character not found.');
    });

    test('updates only provided fields', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        const updatedChar = { ...fakeCharacter, name: 'New Name' };
        characterUpdateMock.mockResolvedValueOnce(updatedChar);

        const result = await resolvers.updateCharacter(
            {}, { id: 'char-1', input: { name: 'New Name' } }, authedCtx,
        );

        expect(characterUpdateMock).toHaveBeenCalledTimes(1);
        const callArgs = characterUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.name).toBe('New Name');
        expect(result).toEqual(updatedChar);
    });
});

describe('characterResolvers — deleteCharacter', () => {
    beforeEach(clearAllMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.deleteCharacter({}, { id: 'char-1' }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('returns true on successful delete', async () => {
        characterDeleteManyMock.mockResolvedValueOnce({ count: 1 });

        const result = await resolvers.deleteCharacter({}, { id: 'char-1' }, authedCtx);

        expect(result).toBe(true);
        const callArgs = characterDeleteManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.where).toEqual({ id: 'char-1', ownerUserId: 'user-abc' });
    });

    test('throws when character not found', () => {
        characterDeleteManyMock.mockResolvedValueOnce({ count: 0 });

        expect(resolvers.deleteCharacter({}, { id: 'char-1' }, authedCtx))
            .rejects.toThrow('Character not found.');
    });
});

describe('characterResolvers — toggleInspiration', () => {
    beforeEach(clearAllMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.toggleInspiration({}, { characterId: 'char-1' }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('flips inspiration from false to true', async () => {
        characterFindFirstMock.mockResolvedValueOnce({ ...fakeCharacter, inspiration: false });
        const updated = { ...fakeCharacter, inspiration: true };
        characterUpdateMock.mockResolvedValueOnce(updated);

        const result = await resolvers.toggleInspiration({}, { characterId: 'char-1' }, authedCtx);

        expect(characterUpdateMock).toHaveBeenCalledTimes(1);
        const callArgs = characterUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.inspiration).toBe(true);
        expect(result).toEqual(updated);
    });

    test('flips inspiration from true to false', async () => {
        characterFindFirstMock.mockResolvedValueOnce({ ...fakeCharacter, inspiration: true });
        const updated = { ...fakeCharacter, inspiration: false };
        characterUpdateMock.mockResolvedValueOnce(updated);

        const result = await resolvers.toggleInspiration({}, { characterId: 'char-1' }, authedCtx);

        const callArgs = characterUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.inspiration).toBe(false);
        expect(result).toEqual(updated);
    });
});

// ---------------------------------------------------------------------------
// Per-domain stats mutations
// ---------------------------------------------------------------------------

describe('characterResolvers — updateAbilityScores', () => {
    beforeEach(clearAllMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.updateAbilityScores(
            {}, { characterId: 'char-1', input: {} as any }, unauthedCtx,
        )).rejects.toThrow('UNAUTHENTICATED');
    });

    test('updates ability scores on the stats row', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        const newScores = { strength: 10, dexterity: 16, constitution: 14, intelligence: 20, wisdom: 13, charisma: 11 };
        const updatedStats = { ...fakeStats, abilityScores: newScores };
        statsUpdateMock.mockResolvedValueOnce(updatedStats);

        const result = await resolvers.updateAbilityScores(
            {}, { characterId: 'char-1', input: newScores }, authedCtx,
        );

        expect(statsUpdateMock).toHaveBeenCalledTimes(1);
        const callArgs = statsUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.abilityScores).toEqual(newScores);
        expect(result).toEqual(updatedStats);
    });

    test('throws when character not found', () => {
        characterFindFirstMock.mockResolvedValueOnce(null);

        expect(resolvers.updateAbilityScores(
            {}, { characterId: 'char-1', input: {} as any }, authedCtx,
        )).rejects.toThrow('Character not found.');
    });
});

describe('characterResolvers — updateHP', () => {
    beforeEach(clearAllMocks);

    test('updates HP on the stats row', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        const newHP = { current: 30, max: 76, temp: 0 };
        const updatedStats = { ...fakeStats, hp: newHP };
        statsUpdateMock.mockResolvedValueOnce(updatedStats);

        const result = await resolvers.updateHP(
            {}, { characterId: 'char-1', input: newHP }, authedCtx,
        );

        expect(statsUpdateMock).toHaveBeenCalledTimes(1);
        const callArgs = statsUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.hp).toEqual(newHP);
        expect(result).toEqual(updatedStats);
    });
});

describe('characterResolvers — updateDeathSaves', () => {
    beforeEach(clearAllMocks);

    test('updates death saves on the stats row', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        const newDS = { successes: 2, failures: 1 };
        const updatedStats = { ...fakeStats, deathSaves: newDS };
        statsUpdateMock.mockResolvedValueOnce(updatedStats);

        const result = await resolvers.updateDeathSaves(
            {}, { characterId: 'char-1', input: newDS }, authedCtx,
        );

        const callArgs = statsUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.deathSaves).toEqual(newDS);
        expect(result).toEqual(updatedStats);
    });
});

describe('characterResolvers — updateHitDice', () => {
    beforeEach(clearAllMocks);

    test('updates hit dice on the stats row', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        const newHD = { total: 12, remaining: 8, die: 'd6' };
        const updatedStats = { ...fakeStats, hitDice: newHD };
        statsUpdateMock.mockResolvedValueOnce(updatedStats);

        const result = await resolvers.updateHitDice(
            {}, { characterId: 'char-1', input: newHD }, authedCtx,
        );

        const callArgs = statsUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.hitDice).toEqual(newHD);
        expect(result).toEqual(updatedStats);
    });
});

describe('characterResolvers — updateSkillProficiencies', () => {
    beforeEach(clearAllMocks);

    test('merges provided skills over existing', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        const input = { perception: 'proficient' };
        const merged = { ...fakeStats.skillProficiencies, perception: 'proficient' };
        statsUpdateMock.mockResolvedValueOnce({ ...fakeStats, skillProficiencies: merged });

        await resolvers.updateSkillProficiencies(
            {}, { characterId: 'char-1', input: input as any }, authedCtx,
        );

        const callArgs = statsUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.skillProficiencies.perception).toBe('proficient');
        // Existing values should be preserved
        expect(callArgs.data.skillProficiencies.arcana).toBe('expert');
    });
});

describe('characterResolvers — updateTraits', () => {
    beforeEach(clearAllMocks);

    test('updates traits on the stats row', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        const newTraits = { personality: 'Bold', ideals: 'Freedom', bonds: 'Family', flaws: 'Reckless' };
        statsUpdateMock.mockResolvedValueOnce({ ...fakeStats, traits: newTraits });

        const result = await resolvers.updateTraits(
            {}, { characterId: 'char-1', input: newTraits }, authedCtx,
        );

        const callArgs = statsUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.traits).toEqual(newTraits);
        expect(result.traits).toEqual(newTraits);
    });
});

describe('characterResolvers — updateCurrency', () => {
    beforeEach(clearAllMocks);

    test('updates currency on the stats row', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        const newCurrency = { cp: 10, sp: 20, ep: 0, gp: 500, pp: 5 };
        statsUpdateMock.mockResolvedValueOnce({ ...fakeStats, currency: newCurrency });

        const result = await resolvers.updateCurrency(
            {}, { characterId: 'char-1', input: newCurrency }, authedCtx,
        );

        const callArgs = statsUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.currency).toEqual(newCurrency);
        expect(result.currency).toEqual(newCurrency);
    });
});

describe('characterResolvers — updateSavingThrowProficiencies', () => {
    beforeEach(clearAllMocks);

    test('updates saving throw proficiencies on the stats row', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        const newProfs = ['strength', 'constitution', 'intelligence'];
        statsUpdateMock.mockResolvedValueOnce({ ...fakeStats, savingThrowProficiencies: newProfs });

        const result = await resolvers.updateSavingThrowProficiencies(
            {}, { characterId: 'char-1', input: { proficiencies: newProfs } }, authedCtx,
        );

        const callArgs = statsUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(callArgs.data.savingThrowProficiencies).toEqual(newProfs);
        expect(result.savingThrowProficiencies).toEqual(newProfs);
    });
});

// ---------------------------------------------------------------------------
// Field resolvers
// ---------------------------------------------------------------------------

describe('characterResolvers — field resolvers', () => {
    beforeEach(clearAllMocks);

    test('characterStats calls findUnique with characterId', async () => {
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);

        const result = await resolvers.characterStats(fakeCharacter as any);

        expect(statsFindUniqueMock).toHaveBeenCalledTimes(1);
        const args = statsFindUniqueMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ characterId: 'char-1' });
        expect(result).toEqual(fakeStats);
    });

    test('characterAttacks calls attack.findMany with characterId', async () => {
        const fakeAttacks = [{ id: 'atk-1', name: 'Dagger' }];
        attackFindManyMock.mockResolvedValueOnce(fakeAttacks);

        const result = await resolvers.characterAttacks(fakeCharacter as any);

        expect(attackFindManyMock).toHaveBeenCalledTimes(1);
        const args = attackFindManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ characterId: 'char-1' });
        expect(result).toEqual(fakeAttacks);
    });

    test('characterInventory calls inventoryItem.findMany with characterId', async () => {
        inventoryItemFindManyMock.mockResolvedValueOnce([]);

        await resolvers.characterInventory(fakeCharacter as any);

        const args = inventoryItemFindManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ characterId: 'char-1' });
    });

    test('characterFeatures calls characterFeature.findMany with characterId', async () => {
        characterFeatureFindManyMock.mockResolvedValueOnce([]);

        await resolvers.characterFeatures(fakeCharacter as any);

        const args = characterFeatureFindManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ characterId: 'char-1' });
    });

    test('characterSpellSlots calls spellSlot.findMany ordered by level', async () => {
        spellSlotFindManyMock.mockResolvedValueOnce([]);

        await resolvers.characterSpellSlots(fakeCharacter as any);

        const args = spellSlotFindManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ characterId: 'char-1' });
        expect(args.orderBy).toEqual({ level: 'asc' });
    });

    test('characterPreparedSpells calls findMany with include spell', async () => {
        preparedSpellFindManyMock.mockResolvedValueOnce([]);

        await resolvers.characterPreparedSpells(fakeCharacter as any);

        const args = preparedSpellFindManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ characterId: 'char-1' });
        expect(args.include).toEqual({ spell: true });
    });
});
