import type { Context } from "../..";
import type {
    MutationAddAttackArgs,
    MutationAddFeatureArgs,
    MutationAddInventoryItemArgs,
    MutationRemoveAttackArgs,
    MutationRemoveFeatureArgs,
    MutationRemoveInventoryItemArgs,
} from "../../generated/graphql";
import { requireUser } from "../../lib/auth";
import prisma from "../../prisma/prisma";
import { findOwnedCharacter, stripNullishFields } from "./helpers";

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
