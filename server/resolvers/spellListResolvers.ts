import type { Context } from "..";
import type {
    MutationCreateSpellListArgs,
    MutationRenameSpellListArgs,
    MutationDeleteSpellListArgs,
    MutationAddSpellToListArgs,
    MutationRemoveSpellFromListArgs,
} from "../generated/graphql";
import type { SpellList } from "@prisma/client";
import { requireUser } from "../lib/auth";
import prisma from "../prisma/prisma";

export async function currentUserLists(
    _parent: unknown,
    _args: unknown,
    ctx: Context,
) {
    const userId = requireUser(ctx);

    return await prisma.spellList.findMany({
        where: { ownerUserId: userId },
        orderBy: { createdAt: 'asc' },
    });
}

export async function create(
    _parent: unknown,
    { name }: MutationCreateSpellListArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);

    return await prisma.spellList.create({
        data: {
            name,
            ownerUserId: userId,
        },
    });
}

export async function rename(
    _parent: unknown,
    { id, name }: MutationRenameSpellListArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);

    const result = await prisma.spellList.updateMany({
        where: { id, ownerUserId: userId },
        data: { name },
    });

    if (result.count === 0) throw new Error('Spell List not found.');

    return true;
}

export async function destroy(
    _parent: unknown,
    { id }: MutationDeleteSpellListArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);

    const result = await prisma.spellList.deleteMany({
        where: { id, ownerUserId: userId },
    });

    if (result.count === 0) throw new Error('Spell List not found.');

    return true;
}

export async function addSpellToList(
    _parent: unknown,
    { spellListId, spellId }: MutationAddSpellToListArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);

    const list = await prisma.spellList.findFirst({
        where: { id: spellListId, ownerUserId: userId },
    });
    if (!list) throw new Error('Spell List not found.');

    await prisma.spellListSpell.upsert({
        where: { spellListId_spellId: { spellListId, spellId } },
        create: { spellListId, spellId },
        update: {},
    });

    return list;
}

export async function removeSpellFromList(
    _parent: unknown,
    { spellListId, spellId }: MutationRemoveSpellFromListArgs,
    ctx: Context,
) {
    const userId = requireUser(ctx);

    const list = await prisma.spellList.findFirst({
        where: { id: spellListId, ownerUserId: userId },
    });
    if (!list) throw new Error('Spell List not found.');

    await prisma.spellListSpell.deleteMany({
        where: { spellListId, spellId },
    });

    return list;
}

// Field resolver: when a query requests SpellList.spells, Apollo calls this
// to resolve the nested `spells` field on each SpellList object.
export async function spellListSpells(parent: SpellList) {
    const entries = await prisma.spellListSpell.findMany({
        where: { spellListId: parent.id },
        include: { spell: true },
        orderBy: { addedAt: 'asc' },
    });

    return entries.map((entry) => entry.spell);
}
