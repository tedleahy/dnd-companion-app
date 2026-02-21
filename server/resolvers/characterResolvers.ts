import type { Context } from "..";
import type { Character as PrismaCharacter } from "@prisma/client";
import type {
    MutationCreateCharacterArgs,
    MutationUpdateCharacterArgs,
    MutationDeleteCharacterArgs,
    MutationToggleInspirationArgs,
    MutationUpdateAbilityScoresArgs,
    MutationUpdateHpArgs,
    MutationUpdateDeathSavesArgs,
    MutationUpdateHitDiceArgs,
    MutationUpdateSkillProficienciesArgs,
    MutationUpdateTraitsArgs,
    MutationUpdateCurrencyArgs,
    MutationUpdateSavingThrowProficienciesArgs,
    QueryCharacterArgs,
} from "../generated/graphql";
import { requireUser } from "../lib/auth";
import prisma from "../prisma/prisma";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_SKILL_PROFICIENCIES = {
    acrobatics: 'none',
    animalHandling: 'none',
    arcana: 'none',
    athletics: 'none',
    deception: 'none',
    history: 'none',
    insight: 'none',
    intimidation: 'none',
    investigation: 'none',
    medicine: 'none',
    nature: 'none',
    perception: 'none',
    performance: 'none',
    persuasion: 'none',
    religion: 'none',
    sleightOfHand: 'none',
    stealth: 'none',
    survival: 'none',
};

const DEFAULT_TRAITS = { personality: '', ideals: '', bonds: '', flaws: '' };
const DEFAULT_CURRENCY = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };

async function findOwnedCharacter(characterId: string, userId: string) {
    const character = await prisma.character.findFirst({
        where: { id: characterId, ownerUserId: userId },
    });
    if (!character) throw new Error('Character not found.');
    return character;
}

async function findOwnedStats(characterId: string, userId: string) {
    await findOwnedCharacter(characterId, userId);
    const stats = await prisma.characterStats.findUnique({
        where: { characterId },
    });
    if (!stats) throw new Error('Character stats not found.');
    return stats;
}

// ---------------------------------------------------------------------------
// Query resolvers
// ---------------------------------------------------------------------------

export async function character(
    _parent: unknown,
    { id }: QueryCharacterArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);

    return await prisma.character.findFirst({
        where: { id, ownerUserId: userId },
    });
}

export async function currentUserCharacters(
    _parent: unknown,
    _args: unknown,
    ctx: Context,
) {
    const userId = requireUser(ctx);

    return await prisma.character.findMany({
        where: { ownerUserId: userId },
        orderBy: { createdAt: 'asc' },
    });
}

// ---------------------------------------------------------------------------
// Character lifecycle mutations
// ---------------------------------------------------------------------------

export async function createCharacter(
    _parent: unknown,
    { input }: MutationCreateCharacterArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);

    const {
        abilityScores,
        hp,
        hitDice,
        savingThrowProficiencies,
        skillProficiencies,
        traits,
        currency,
        ...characterFields
    } = input;

    return await prisma.character.create({
        data: {
            ...characterFields,
            ownerUserId: userId,
            stats: {
                create: {
                    abilityScores,
                    hp,
                    deathSaves: { successes: 0, failures: 0 },
                    hitDice,
                    savingThrowProficiencies: savingThrowProficiencies ?? [],
                    skillProficiencies: { ...DEFAULT_SKILL_PROFICIENCIES, ...skillProficiencies },
                    traits: traits ?? DEFAULT_TRAITS,
                    currency: currency ?? DEFAULT_CURRENCY,
                },
            },
        },
    });
}

export async function updateCharacter(
    _parent: unknown,
    { id, input }: MutationUpdateCharacterArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);

    const existing = await findOwnedCharacter(id, userId);

    // Strip null/undefined values so we only update provided fields
    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
        if (value !== undefined && value !== null) {
            data[key] = value;
        }
    }

    return await prisma.character.update({
        where: { id: existing.id },
        data,
    });
}

export async function deleteCharacter(
    _parent: unknown,
    { id }: MutationDeleteCharacterArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);

    const result = await prisma.character.deleteMany({
        where: { id, ownerUserId: userId },
    });

    if (result.count === 0) throw new Error('Character not found.');

    return true;
}

export async function toggleInspiration(
    _parent: unknown,
    { characterId }: MutationToggleInspirationArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const existing = await findOwnedCharacter(characterId, userId);

    return await prisma.character.update({
        where: { id: existing.id },
        data: { inspiration: !existing.inspiration },
    });
}

// ---------------------------------------------------------------------------
// Per-domain stats mutations
// ---------------------------------------------------------------------------

export async function updateAbilityScores(
    _parent: unknown,
    { characterId, input }: MutationUpdateAbilityScoresArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const stats = await findOwnedStats(characterId, userId);

    return await prisma.characterStats.update({
        where: { id: stats.id },
        data: { abilityScores: input },
    });
}

export async function updateHP(
    _parent: unknown,
    { characterId, input }: MutationUpdateHpArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const stats = await findOwnedStats(characterId, userId);

    return await prisma.characterStats.update({
        where: { id: stats.id },
        data: { hp: input },
    });
}

export async function updateDeathSaves(
    _parent: unknown,
    { characterId, input }: MutationUpdateDeathSavesArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const stats = await findOwnedStats(characterId, userId);

    return await prisma.characterStats.update({
        where: { id: stats.id },
        data: { deathSaves: input },
    });
}

export async function updateHitDice(
    _parent: unknown,
    { characterId, input }: MutationUpdateHitDiceArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const stats = await findOwnedStats(characterId, userId);

    return await prisma.characterStats.update({
        where: { id: stats.id },
        data: { hitDice: input },
    });
}

export async function updateSkillProficiencies(
    _parent: unknown,
    { characterId, input }: MutationUpdateSkillProficienciesArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const stats = await findOwnedStats(characterId, userId);

    // Merge provided fields over existing skill proficiencies
    const existing = stats.skillProficiencies as Record<string, string>;
    const merged = { ...existing };
    for (const [key, value] of Object.entries(input)) {
        if (value !== undefined && value !== null) {
            merged[key] = value;
        }
    }

    return await prisma.characterStats.update({
        where: { id: stats.id },
        data: { skillProficiencies: merged },
    });
}

export async function updateTraits(
    _parent: unknown,
    { characterId, input }: MutationUpdateTraitsArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const stats = await findOwnedStats(characterId, userId);

    return await prisma.characterStats.update({
        where: { id: stats.id },
        data: { traits: input },
    });
}

export async function updateCurrency(
    _parent: unknown,
    { characterId, input }: MutationUpdateCurrencyArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const stats = await findOwnedStats(characterId, userId);

    return await prisma.characterStats.update({
        where: { id: stats.id },
        data: { currency: input },
    });
}

export async function updateSavingThrowProficiencies(
    _parent: unknown,
    { characterId, input }: MutationUpdateSavingThrowProficienciesArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const stats = await findOwnedStats(characterId, userId);

    return await prisma.characterStats.update({
        where: { id: stats.id },
        data: { savingThrowProficiencies: input.proficiencies },
    });
}

// ---------------------------------------------------------------------------
// Field resolvers for Character type
// ---------------------------------------------------------------------------

export async function characterStats(parent: PrismaCharacter) {
    return await prisma.characterStats.findUnique({
        where: { characterId: parent.id },
    });
}

export async function characterAttacks(parent: PrismaCharacter) {
    return await prisma.attack.findMany({
        where: { characterId: parent.id },
    });
}

export async function characterInventory(parent: PrismaCharacter) {
    return await prisma.inventoryItem.findMany({
        where: { characterId: parent.id },
    });
}

export async function characterFeatures(parent: PrismaCharacter) {
    return await prisma.characterFeature.findMany({
        where: { characterId: parent.id },
    });
}

export async function characterSpellSlots(parent: PrismaCharacter) {
    return await prisma.spellSlot.findMany({
        where: { characterId: parent.id },
        orderBy: { level: 'asc' },
    });
}

export async function characterPreparedSpells(parent: PrismaCharacter) {
    return await prisma.characterPreparedSpell.findMany({
        where: { characterId: parent.id },
        include: { spell: true },
    });
}
