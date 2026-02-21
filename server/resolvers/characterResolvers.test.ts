import { describe, expect, test, mock, beforeEach } from 'bun:test';

// ---------------------------------------------------------------------------
// Mock Prisma and auth, same pattern as spellsResolver.test.ts.
//
// We create individual mocks for each Prisma model method the resolvers use,
// then wire them into a fake prisma object that mock.module() returns.
// ---------------------------------------------------------------------------

// character model mocks
const characterFindFirstMock: any = mock((_args: unknown) => Promise.resolve(null));
const characterFindManyMock: any = mock((_args: unknown) => Promise.resolve([]));
const characterCreateMock: any = mock((_args: unknown) => Promise.resolve({}));
const characterUpdateMock: any = mock((_args: unknown) => Promise.resolve({}));
const characterDeleteManyMock: any = mock((_args: unknown) => Promise.resolve({ count: 1 }));

// characterStats model mocks
const statsFindUniqueMock: any = mock((_args: unknown) => Promise.resolve(null));
const statsUpdateMock: any = mock((_args: unknown) => Promise.resolve({}));

// field resolver model mocks
const attackFindManyMock: any = mock((_args: unknown) => Promise.resolve([]));
const inventoryItemFindManyMock: any = mock((_args: unknown) => Promise.resolve([]));
const characterFeatureFindManyMock: any = mock((_args: unknown) => Promise.resolve([]));
const spellSlotFindManyMock: any = mock((_args: unknown) => Promise.resolve([]));
const characterSpellFindManyMock: any = mock((_args: unknown) => Promise.resolve([]));

// Phase 2 mocks
const characterSpellUpsertMock: any = mock((_args: unknown) => Promise.resolve({}));
const characterSpellDeleteManyMock: any = mock((_args: unknown) => Promise.resolve({ count: 1 }));
const characterSpellUpdateMock: any = mock((_args: unknown) => Promise.resolve({}));
const spellSlotFindUniqueMock: any = mock((_args: unknown) => Promise.resolve(null));
const spellSlotUpdateMock: any = mock((_args: unknown) => Promise.resolve({}));
const spellSlotUpdateManyMock: any = mock((_args: unknown) => Promise.resolve({ count: 0 }));
const attackCreateMock: any = mock((_args: unknown) => Promise.resolve({}));
const attackDeleteManyMock: any = mock((_args: unknown) => Promise.resolve({ count: 1 }));
const inventoryItemCreateMock: any = mock((_args: unknown) => Promise.resolve({}));
const inventoryItemDeleteManyMock: any = mock((_args: unknown) => Promise.resolve({ count: 1 }));
const characterFeatureCreateMock: any = mock((_args: unknown) => Promise.resolve({}));
const characterFeatureDeleteManyMock: any = mock((_args: unknown) => Promise.resolve({ count: 1 }));
const characterFeatureUpdateManyMock: any = mock((_args: unknown) => Promise.resolve({ count: 0 }));
const executeRawMock: any = mock((_args: unknown) => Promise.resolve(0));

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
        characterSpell: {
            findMany: characterSpellFindManyMock,
            upsert: characterSpellUpsertMock,
            deleteMany: characterSpellDeleteManyMock,
            update: characterSpellUpdateMock,
        },
        attack: {
            findMany: attackFindManyMock,
            create: attackCreateMock,
            deleteMany: attackDeleteManyMock,
        },
        inventoryItem: {
            findMany: inventoryItemFindManyMock,
            create: inventoryItemCreateMock,
            deleteMany: inventoryItemDeleteManyMock,
        },
        characterFeature: {
            findMany: characterFeatureFindManyMock,
            create: characterFeatureCreateMock,
            deleteMany: characterFeatureDeleteManyMock,
            updateMany: characterFeatureUpdateManyMock,
        },
        spellSlot: {
            findMany: spellSlotFindManyMock,
            findUnique: spellSlotFindUniqueMock,
            update: spellSlotUpdateMock,
            updateMany: spellSlotUpdateManyMock,
        },
        $executeRaw: executeRawMock,
    },
}));

mock.module('../lib/auth', () => ({
    requireUser(ctx: { userId: string | null }): string {
        if (!ctx.userId) throw new Error('UNAUTHENTICATED');
        return ctx.userId;
    },
}));

const resolvers: any = await import('./characterResolvers');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const authedCtx = { userId: 'user-abc' };
const unauthedCtx = { userId: null };

const fakeCharacter: any = {
    id: 'char-1',
    ownerUserId: 'user-abc',
    name: 'Vaelindra',
    inspiration: false,
};

const fakeStats: any = {
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
    characterSpellFindManyMock.mockClear();
    characterSpellUpsertMock.mockClear();
    characterSpellDeleteManyMock.mockClear();
    characterSpellUpdateMock.mockClear();
    spellSlotFindUniqueMock.mockClear();
    spellSlotUpdateMock.mockClear();
    spellSlotUpdateManyMock.mockClear();
    attackCreateMock.mockClear();
    attackDeleteManyMock.mockClear();
    inventoryItemCreateMock.mockClear();
    inventoryItemDeleteManyMock.mockClear();
    characterFeatureCreateMock.mockClear();
    characterFeatureDeleteManyMock.mockClear();
    characterFeatureUpdateManyMock.mockClear();
    executeRawMock.mockClear();
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

    test('characterSpellbook calls findMany with include spell', async () => {
        characterSpellFindManyMock.mockResolvedValueOnce([]);

        await resolvers.characterSpellbook(fakeCharacter as any);

        const args = characterSpellFindManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ characterId: 'char-1' });
        expect(args.include).toEqual({ spell: true });
    });
});

// ---------------------------------------------------------------------------
// Phase 2 — Spellbook / spell slot mutations
// ---------------------------------------------------------------------------

describe('characterResolvers — learnSpell', () => {
    beforeEach(clearAllMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.learnSpell({}, { characterId: 'char-1', spellId: 'spell-1' }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('upserts a CharacterSpell row with prepared: false', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        const created = { characterId: 'char-1', spellId: 'spell-1', prepared: false };
        characterSpellUpsertMock.mockResolvedValueOnce(created);

        const result = await resolvers.learnSpell({}, { characterId: 'char-1', spellId: 'spell-1' }, authedCtx);

        expect(characterSpellUpsertMock).toHaveBeenCalledTimes(1);
        const args = characterSpellUpsertMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ characterId_spellId: { characterId: 'char-1', spellId: 'spell-1' } });
        expect(args.create.prepared).toBe(false);
        expect(args.include).toEqual({ spell: true });
        expect(result).toEqual(created);
    });

    test('throws when character not found', () => {
        characterFindFirstMock.mockResolvedValueOnce(null);

        expect(resolvers.learnSpell({}, { characterId: 'char-1', spellId: 'spell-1' }, authedCtx))
            .rejects.toThrow('Character not found.');
    });
});

describe('characterResolvers — forgetSpell', () => {
    beforeEach(clearAllMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.forgetSpell({}, { characterId: 'char-1', spellId: 'spell-1' }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('deletes the CharacterSpell row and returns true', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        characterSpellDeleteManyMock.mockResolvedValueOnce({ count: 1 });

        const result = await resolvers.forgetSpell({}, { characterId: 'char-1', spellId: 'spell-1' }, authedCtx);

        expect(result).toBe(true);
        const args = characterSpellDeleteManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ characterId: 'char-1', spellId: 'spell-1' });
    });

    test('throws when spell not in spellbook', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        characterSpellDeleteManyMock.mockResolvedValueOnce({ count: 0 });

        expect(resolvers.forgetSpell({}, { characterId: 'char-1', spellId: 'spell-1' }, authedCtx))
            .rejects.toThrow('Spell not in spellbook.');
    });
});

describe('characterResolvers — prepareSpell', () => {
    beforeEach(clearAllMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.prepareSpell({}, { characterId: 'char-1', spellId: 'spell-1' }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('sets prepared to true on existing CharacterSpell', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        const updated = { characterId: 'char-1', spellId: 'spell-1', prepared: true };
        characterSpellUpdateMock.mockResolvedValueOnce(updated);

        const result = await resolvers.prepareSpell({}, { characterId: 'char-1', spellId: 'spell-1' }, authedCtx);

        expect(characterSpellUpdateMock).toHaveBeenCalledTimes(1);
        const args = characterSpellUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.data.prepared).toBe(true);
        expect(args.include).toEqual({ spell: true });
        expect(result).toEqual(updated);
    });
});

describe('characterResolvers — unprepareSpell', () => {
    beforeEach(clearAllMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.unprepareSpell({}, { characterId: 'char-1', spellId: 'spell-1' }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('sets prepared to false on existing CharacterSpell', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        const updated = { characterId: 'char-1', spellId: 'spell-1', prepared: false };
        characterSpellUpdateMock.mockResolvedValueOnce(updated);

        const result = await resolvers.unprepareSpell({}, { characterId: 'char-1', spellId: 'spell-1' }, authedCtx);

        const args = characterSpellUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.data.prepared).toBe(false);
        expect(result).toEqual(updated);
    });
});

describe('characterResolvers — toggleSpellSlot', () => {
    beforeEach(clearAllMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.toggleSpellSlot({}, { characterId: 'char-1', level: 1 }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('increments used when not all used', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        const slot = { id: 'slot-1', characterId: 'char-1', level: 1, total: 4, used: 2 };
        spellSlotFindUniqueMock.mockResolvedValueOnce(slot);
        const updated = { ...slot, used: 3 };
        spellSlotUpdateMock.mockResolvedValueOnce(updated);

        const result = await resolvers.toggleSpellSlot({}, { characterId: 'char-1', level: 1 }, authedCtx);

        const args = spellSlotUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.data.used).toBe(3);
        expect(result).toEqual(updated);
    });

    test('resets used to 0 when all slots are used', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        const slot = { id: 'slot-1', characterId: 'char-1', level: 1, total: 4, used: 4 };
        spellSlotFindUniqueMock.mockResolvedValueOnce(slot);
        const updated = { ...slot, used: 0 };
        spellSlotUpdateMock.mockResolvedValueOnce(updated);

        const result = await resolvers.toggleSpellSlot({}, { characterId: 'char-1', level: 1 }, authedCtx);

        const args = spellSlotUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.data.used).toBe(0);
        expect(result).toEqual(updated);
    });

    test('throws when spell slot not found', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        spellSlotFindUniqueMock.mockResolvedValueOnce(null);

        expect(resolvers.toggleSpellSlot({}, { characterId: 'char-1', level: 9 }, authedCtx))
            .rejects.toThrow('Spell slot not found.');
    });
});

// ---------------------------------------------------------------------------
// Phase 2 — Gear / features mutations
// ---------------------------------------------------------------------------

describe('characterResolvers — addAttack', () => {
    beforeEach(clearAllMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.addAttack({}, { characterId: 'char-1', input: {} as any }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('creates an attack for the character', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        const input = { name: 'Dagger', attackBonus: '+7', damage: '1d4+3 P', type: 'melee' };
        const created = { id: 'atk-1', characterId: 'char-1', ...input };
        attackCreateMock.mockResolvedValueOnce(created);

        const result = await resolvers.addAttack({}, { characterId: 'char-1', input }, authedCtx);

        expect(attackCreateMock).toHaveBeenCalledTimes(1);
        const args = attackCreateMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.data.characterId).toBe('char-1');
        expect(args.data.name).toBe('Dagger');
        expect(result).toEqual(created);
    });
});

describe('characterResolvers — removeAttack', () => {
    beforeEach(clearAllMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.removeAttack({}, { characterId: 'char-1', attackId: 'atk-1' }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('deletes the attack and returns true', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        attackDeleteManyMock.mockResolvedValueOnce({ count: 1 });

        const result = await resolvers.removeAttack({}, { characterId: 'char-1', attackId: 'atk-1' }, authedCtx);

        expect(result).toBe(true);
        const args = attackDeleteManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ id: 'atk-1', characterId: 'char-1' });
    });

    test('throws when attack not found', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        attackDeleteManyMock.mockResolvedValueOnce({ count: 0 });

        expect(resolvers.removeAttack({}, { characterId: 'char-1', attackId: 'atk-1' }, authedCtx))
            .rejects.toThrow('Attack not found.');
    });
});

describe('characterResolvers — addInventoryItem', () => {
    beforeEach(clearAllMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.addInventoryItem({}, { characterId: 'char-1', input: {} as any }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('creates an inventory item for the character', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        const input = { name: 'Rope', quantity: 1 };
        const created = { id: 'item-1', characterId: 'char-1', ...input };
        inventoryItemCreateMock.mockResolvedValueOnce(created);

        const result = await resolvers.addInventoryItem({}, { characterId: 'char-1', input }, authedCtx);

        expect(inventoryItemCreateMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(created);
    });
});

describe('characterResolvers — removeInventoryItem', () => {
    beforeEach(clearAllMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.removeInventoryItem({}, { characterId: 'char-1', itemId: 'item-1' }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('deletes the item and returns true', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        inventoryItemDeleteManyMock.mockResolvedValueOnce({ count: 1 });

        const result = await resolvers.removeInventoryItem({}, { characterId: 'char-1', itemId: 'item-1' }, authedCtx);

        expect(result).toBe(true);
        const args = inventoryItemDeleteManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ id: 'item-1', characterId: 'char-1' });
    });

    test('throws when item not found', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        inventoryItemDeleteManyMock.mockResolvedValueOnce({ count: 0 });

        expect(resolvers.removeInventoryItem({}, { characterId: 'char-1', itemId: 'item-1' }, authedCtx))
            .rejects.toThrow('Inventory item not found.');
    });
});

describe('characterResolvers — addFeature', () => {
    beforeEach(clearAllMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.addFeature({}, { characterId: 'char-1', input: {} as any }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('creates a feature for the character', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        const input = { name: 'Arcane Recovery', source: 'Wizard 1', description: 'Recover spell slots' };
        const created = { id: 'feat-1', characterId: 'char-1', ...input };
        characterFeatureCreateMock.mockResolvedValueOnce(created);

        const result = await resolvers.addFeature({}, { characterId: 'char-1', input }, authedCtx);

        expect(characterFeatureCreateMock).toHaveBeenCalledTimes(1);
        const args = characterFeatureCreateMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.data.characterId).toBe('char-1');
        expect(args.data.name).toBe('Arcane Recovery');
        expect(result).toEqual(created);
    });
});

describe('characterResolvers — removeFeature', () => {
    beforeEach(clearAllMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.removeFeature({}, { characterId: 'char-1', featureId: 'feat-1' }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('deletes the feature and returns true', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        characterFeatureDeleteManyMock.mockResolvedValueOnce({ count: 1 });

        const result = await resolvers.removeFeature({}, { characterId: 'char-1', featureId: 'feat-1' }, authedCtx);

        expect(result).toBe(true);
        const args = characterFeatureDeleteManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.where).toEqual({ id: 'feat-1', characterId: 'char-1' });
    });

    test('throws when feature not found', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        characterFeatureDeleteManyMock.mockResolvedValueOnce({ count: 0 });

        expect(resolvers.removeFeature({}, { characterId: 'char-1', featureId: 'feat-1' }, authedCtx))
            .rejects.toThrow('Feature not found.');
    });
});

// ---------------------------------------------------------------------------
// Phase 2 — Rest / recovery mutations
// ---------------------------------------------------------------------------

describe('characterResolvers — spendHitDie', () => {
    beforeEach(clearAllMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.spendHitDie({}, { characterId: 'char-1', amount: 1 }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('decrements hitDice.remaining by amount', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        statsFindUniqueMock.mockResolvedValueOnce(fakeStats);
        const updatedStats = { ...fakeStats, hitDice: { total: 12, remaining: 10, die: 'd6' } };
        statsUpdateMock.mockResolvedValueOnce(updatedStats);

        const result = await resolvers.spendHitDie({}, { characterId: 'char-1', amount: 2 }, authedCtx);

        const args = statsUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.data.hitDice.remaining).toBe(10);
        expect(result).toEqual(updatedStats);
    });

    test('floors remaining at 0', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        const lowStats = { ...fakeStats, hitDice: { total: 12, remaining: 1, die: 'd6' } };
        statsFindUniqueMock.mockResolvedValueOnce(lowStats);
        statsUpdateMock.mockResolvedValueOnce({ ...lowStats, hitDice: { total: 12, remaining: 0, die: 'd6' } });

        await resolvers.spendHitDie({}, { characterId: 'char-1', amount: 5 }, authedCtx);

        const args = statsUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(args.data.hitDice.remaining).toBe(0);
    });
});

describe('characterResolvers — shortRest', () => {
    beforeEach(clearAllMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.shortRest({}, { characterId: 'char-1' }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('calls $executeRaw to restore short-rest features and returns character', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        executeRawMock.mockResolvedValueOnce(2);

        const result = await resolvers.shortRest({}, { characterId: 'char-1' }, authedCtx);

        expect(executeRawMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(fakeCharacter);
    });
});

describe('characterResolvers — longRest', () => {
    beforeEach(clearAllMocks);

    test('throws UNAUTHENTICATED when userId is null', () => {
        expect(resolvers.longRest({}, { characterId: 'char-1' }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('restores HP, resets death saves, recovers hit dice, resets spell slots, restores features', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        const preRestStats = {
            ...fakeStats,
            hp: { current: 30, max: 76, temp: 5 },
            hitDice: { total: 12, remaining: 4, die: 'd6' },
        };
        statsFindUniqueMock.mockResolvedValueOnce(preRestStats);
        // Two statsUpdate calls: one for HP+deathSaves, one for hitDice
        statsUpdateMock
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({});
        spellSlotUpdateManyMock.mockResolvedValueOnce({ count: 3 });
        executeRawMock.mockResolvedValueOnce(2);

        const result = await resolvers.longRest({}, { characterId: 'char-1' }, authedCtx);

        // HP restored to max, temp cleared
        const hpCall = statsUpdateMock.mock.calls[0]![0] as Record<string, any>;
        expect(hpCall.data.hp).toEqual({ current: 76, max: 76, temp: 0 });
        expect(hpCall.data.deathSaves).toEqual({ successes: 0, failures: 0 });

        // Hit dice: recover max(1, floor(12/2)) = 6, so 4 + 6 = 10
        const hdCall = statsUpdateMock.mock.calls[1]![0] as Record<string, any>;
        expect(hdCall.data.hitDice.remaining).toBe(10);

        // Spell slots reset
        expect(spellSlotUpdateManyMock).toHaveBeenCalledTimes(1);
        const slotArgs = spellSlotUpdateManyMock.mock.calls[0]![0] as Record<string, any>;
        expect(slotArgs.data.used).toBe(0);

        // Feature restore via raw query
        expect(executeRawMock).toHaveBeenCalledTimes(1);

        expect(result).toEqual(fakeCharacter);
    });

    test('caps hit dice recovery at total', async () => {
        characterFindFirstMock.mockResolvedValueOnce(fakeCharacter);
        const preRestStats = {
            ...fakeStats,
            hp: { current: 76, max: 76, temp: 0 },
            hitDice: { total: 12, remaining: 11, die: 'd6' },
        };
        statsFindUniqueMock.mockResolvedValueOnce(preRestStats);
        statsUpdateMock
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({});
        spellSlotUpdateManyMock.mockResolvedValueOnce({ count: 0 });
        executeRawMock.mockResolvedValueOnce(0);

        await resolvers.longRest({}, { characterId: 'char-1' }, authedCtx);

        // 11 + 6 = 17, capped at 12
        const hdCall = statsUpdateMock.mock.calls[1]![0] as Record<string, any>;
        expect(hdCall.data.hitDice.remaining).toBe(12);
    });
});
