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
    MutationLearnSpellArgs,
    MutationForgetSpellArgs,
    MutationPrepareSpellArgs,
    MutationUnprepareSpellArgs,
    MutationToggleSpellSlotArgs,
    MutationAddAttackArgs,
    MutationRemoveAttackArgs,
    MutationAddInventoryItemArgs,
    MutationRemoveInventoryItemArgs,
    MutationAddFeatureArgs,
    MutationRemoveFeatureArgs,
    MutationSpendHitDieArgs,
    MutationShortRestArgs,
    MutationLongRestArgs,
    QueryCharacterArgs,
} from "../generated/graphql";
import { requireUser } from "../lib/auth";
import prisma from "../prisma/prisma";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Default skill proficiency map for new characters.
 */
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

/**
 * Default editable personality/metadata fields for a new character.
 */
const DEFAULT_TRAITS = {
    personality: '',
    ideals: '',
    bonds: '',
    flaws: '',
    armorProficiencies: [] as string[],
    weaponProficiencies: [] as string[],
    toolProficiencies: [] as string[],
    languages: [] as string[],
};
/**
 * Default starting currency for a new character.
 */
const DEFAULT_CURRENCY = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };

/**
 * Returns a shallow copy with null/undefined properties removed.
 */
function stripNullishFields<T extends Record<string, unknown>>(input: T): Partial<T> {
    const data: Partial<T> = {};

    for (const [key, value] of Object.entries(input)) {
        if (value !== undefined && value !== null) {
            data[key as keyof T] = value as T[keyof T];
        }
    }

    return data;
}

/**
 * Returns a character only if it belongs to the authenticated user.
 */
async function findOwnedCharacter(characterId: string, userId: string) {
    const character = await prisma.character.findFirst({
        where: { id: characterId, ownerUserId: userId },
    });
    if (!character) throw new Error('Character not found.');
    return character;
}

/**
 * Returns character stats only if the parent character is owned by the user.
 */
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

/**
 * Query resolver for a single owned character by id.
 */
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

/**
 * Query resolver for all characters owned by the current user.
 */
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

/**
 * Creates a character and nested stats row with sensible defaults.
 */
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

/**
 * Updates character top-level fields that are provided in input.
 */
export async function updateCharacter(
    _parent: unknown,
    { id, input }: MutationUpdateCharacterArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);

    const existing = await findOwnedCharacter(id, userId);

    const data = stripNullishFields(input);

    return await prisma.character.update({
        where: { id: existing.id },
        data,
    });
}

/**
 * Deletes an owned character by id.
 */
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

/**
 * Toggles inspiration on/off for an owned character.
 */
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

/**
 * Replaces the ability score object for an owned character.
 */
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

/**
 * Replaces HP values for an owned character.
 */
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

/**
 * Replaces death save values for an owned character.
 */
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

/**
 * Replaces hit dice values for an owned character.
 */
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

/**
 * Partially updates skill proficiency fields, preserving unspecified values.
 */
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

/**
 * Merges editable trait fields over existing trait metadata.
 */
export async function updateTraits(
    _parent: unknown,
    { characterId, input }: MutationUpdateTraitsArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const stats = await findOwnedStats(characterId, userId);
    const existingTraits = stats.traits as Record<string, unknown>;

    return await prisma.characterStats.update({
        where: { id: stats.id },
        data: { traits: { ...existingTraits, ...input } },
    });
}

/**
 * Replaces the currency object for an owned character.
 */
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

/**
 * Replaces saving throw proficiency list for an owned character.
 */
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

/**
 * Field resolver for Character.stats.
 */
export async function characterStats(parent: PrismaCharacter) {
    return await prisma.characterStats.findUnique({
        where: { characterId: parent.id },
    });
}

/**
 * Field resolver for Character.attacks.
 */
export async function characterAttacks(parent: PrismaCharacter) {
    return await prisma.attack.findMany({
        where: { characterId: parent.id },
    });
}

/**
 * Field resolver for Character.inventory.
 */
export async function characterInventory(parent: PrismaCharacter) {
    return await prisma.inventoryItem.findMany({
        where: { characterId: parent.id },
    });
}

/**
 * Field resolver for Character.features.
 */
export async function characterFeatures(parent: PrismaCharacter) {
    return await prisma.characterFeature.findMany({
        where: { characterId: parent.id },
    });
}

/**
 * Field resolver for Character.spellSlots.
 */
export async function characterSpellSlots(parent: PrismaCharacter) {
    return await prisma.spellSlot.findMany({
        where: { characterId: parent.id },
        orderBy: { level: 'asc' },
    });
}

/**
 * Field resolver for Character.spellbook.
 */
export async function characterSpellbook(parent: PrismaCharacter) {
    return await prisma.characterSpell.findMany({
        where: { characterId: parent.id },
        include: { spell: true },
    });
}

// ---------------------------------------------------------------------------
// Spellbook / spell slot mutations
// ---------------------------------------------------------------------------

/**
 * Adds a spell to a character spellbook if missing, else returns existing row.
 */
export async function learnSpell(
    _parent: unknown,
    { characterId, spellId }: MutationLearnSpellArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    await findOwnedCharacter(characterId, userId);

    return await prisma.characterSpell.upsert({
        where: { characterId_spellId: { characterId, spellId } },
        create: { characterId, spellId, prepared: false },
        update: {},
        include: { spell: true },
    });
}

/**
 * Removes a spell from a character spellbook.
 */
export async function forgetSpell(
    _parent: unknown,
    { characterId, spellId }: MutationForgetSpellArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    await findOwnedCharacter(characterId, userId);

    const result = await prisma.characterSpell.deleteMany({
        where: { characterId, spellId },
    });

    if (result.count === 0) throw new Error('Spell not in spellbook.');

    return true;
}

/**
 * Marks a spell as prepared in a character spellbook.
 */
export async function prepareSpell(
    _parent: unknown,
    { characterId, spellId }: MutationPrepareSpellArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    await findOwnedCharacter(characterId, userId);

    return await prisma.characterSpell.update({
        where: { characterId_spellId: { characterId, spellId } },
        data: { prepared: true },
        include: { spell: true },
    });
}

/**
 * Marks a spell as unprepared in a character spellbook.
 */
export async function unprepareSpell(
    _parent: unknown,
    { characterId, spellId }: MutationUnprepareSpellArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    await findOwnedCharacter(characterId, userId);

    return await prisma.characterSpell.update({
        where: { characterId_spellId: { characterId, spellId } },
        data: { prepared: false },
        include: { spell: true },
    });
}

/**
 * Cycles spell-slot usage for a given spell level.
 */
export async function toggleSpellSlot(
    _parent: unknown,
    { characterId, level }: MutationToggleSpellSlotArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    await findOwnedCharacter(characterId, userId);

    const slot = await prisma.spellSlot.findUnique({
        where: { characterId_level: { characterId, level } },
    });
    if (!slot) throw new Error('Spell slot not found.');

    // Toggle: if all used, start recovering; otherwise use one more
    const newUsed = slot.used < slot.total ? slot.used + 1 : 0;

    return await prisma.spellSlot.update({
        where: { id: slot.id },
        data: { used: newUsed },
    });
}

// ---------------------------------------------------------------------------
// Gear / features mutations
// ---------------------------------------------------------------------------

/**
 * Adds an attack row to an owned character.
 */
export async function addAttack(
    _parent: unknown,
    { characterId, input }: MutationAddAttackArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    await findOwnedCharacter(characterId, userId);

    return await prisma.attack.create({
        data: { characterId, ...input },
    });
}

/**
 * Removes an attack row from an owned character.
 */
export async function removeAttack(
    _parent: unknown,
    { characterId, attackId }: MutationRemoveAttackArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    await findOwnedCharacter(characterId, userId);

    const result = await prisma.attack.deleteMany({
        where: { id: attackId, characterId },
    });

    if (result.count === 0) throw new Error('Attack not found.');

    return true;
}

/**
 * Adds an inventory item to an owned character.
 */
export async function addInventoryItem(
    _parent: unknown,
    { characterId, input }: MutationAddInventoryItemArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    await findOwnedCharacter(characterId, userId);

    const data = { characterId, ...stripNullishFields(input) };

    return await prisma.inventoryItem.create({ data: data as any });
}

/**
 * Removes an inventory item from an owned character.
 */
export async function removeInventoryItem(
    _parent: unknown,
    { characterId, itemId }: MutationRemoveInventoryItemArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    await findOwnedCharacter(characterId, userId);

    const result = await prisma.inventoryItem.deleteMany({
        where: { id: itemId, characterId },
    });

    if (result.count === 0) throw new Error('Inventory item not found.');

    return true;
}

/**
 * Adds a feature row to an owned character.
 */
export async function addFeature(
    _parent: unknown,
    { characterId, input }: MutationAddFeatureArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    await findOwnedCharacter(characterId, userId);

    return await prisma.characterFeature.create({
        data: { characterId, ...input },
    });
}

/**
 * Removes a feature row from an owned character.
 */
export async function removeFeature(
    _parent: unknown,
    { characterId, featureId }: MutationRemoveFeatureArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    await findOwnedCharacter(characterId, userId);

    const result = await prisma.characterFeature.deleteMany({
        where: { id: featureId, characterId },
    });

    if (result.count === 0) throw new Error('Feature not found.');

    return true;
}

// ---------------------------------------------------------------------------
// Rest / recovery mutations
// ---------------------------------------------------------------------------

/**
 * Spends hit dice, clamping remaining dice at zero.
 */
export async function spendHitDie(
    _parent: unknown,
    { characterId, amount }: MutationSpendHitDieArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const stats = await findOwnedStats(characterId, userId);

    const hitDice = stats.hitDice as { total: number; remaining: number; die: string };
    const newRemaining = Math.max(0, hitDice.remaining - (amount ?? 1));

    return await prisma.characterStats.update({
        where: { id: stats.id },
        data: { hitDice: { ...hitDice, remaining: newRemaining } },
    });
}

/**
 * Applies short-rest recovery (currently restores short-rest feature uses).
 */
export async function shortRest(
    _parent: unknown,
    { characterId }: MutationShortRestArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const char = await findOwnedCharacter(characterId, userId);

    // Prisma updateMany can't set usesRemaining = usesMax dynamically,
    // so we use a raw query to restore feature uses
    await prisma.$executeRaw`
        UPDATE "CharacterFeature"
        SET "usesRemaining" = "usesMax"
        WHERE "characterId" = ${characterId}
          AND "recharge" = 'short'
          AND "usesMax" IS NOT NULL
    `;

    return char;
}

/**
 * Applies long-rest recovery to HP, death saves, hit dice, slots, and features.
 */
export async function longRest(
    _parent: unknown,
    { characterId }: MutationLongRestArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);
    const char = await findOwnedCharacter(characterId, userId);
    const stats = await prisma.characterStats.findUnique({ where: { characterId } });
    if (!stats) throw new Error('Character stats not found.');

    // 1. Restore HP to max, clear temp HP
    const hp = stats.hp as { current: number; max: number; temp: number };
    await prisma.characterStats.update({
        where: { id: stats.id },
        data: {
            hp: { current: hp.max, max: hp.max, temp: 0 },
            deathSaves: { successes: 0, failures: 0 },
        },
    });

    // 2. Restore hit dice: recover half total (minimum 1)
    const hitDice = stats.hitDice as { total: number; remaining: number; die: string };
    const recovered = Math.max(1, Math.floor(hitDice.total / 2));
    const newRemaining = Math.min(hitDice.total, hitDice.remaining + recovered);
    await prisma.characterStats.update({
        where: { id: stats.id },
        data: { hitDice: { ...hitDice, remaining: newRemaining } },
    });

    // 3. Reset all spell slots
    await prisma.spellSlot.updateMany({
        where: { characterId },
        data: { used: 0 },
    });

    // 4. Restore feature uses (short + long recharge)
    await prisma.$executeRaw`
        UPDATE "CharacterFeature"
        SET "usesRemaining" = "usesMax"
        WHERE "characterId" = ${characterId}
          AND "recharge" IN ('short', 'long')
          AND "usesMax" IS NOT NULL
    `;

    return char;
}
