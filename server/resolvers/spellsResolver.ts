import type { Context } from "..";
import type { QuerySpellsArgs } from "../generated/graphql";
import { requireUser } from "../lib/auth";
import prisma from "../prisma/prisma";

export default async function spellsResolver(
    _parent: unknown,
    args: Partial<QuerySpellsArgs>,
    ctx: Context,
) {
    requireUser(ctx);

    try {
        const filter = args.filter;
        const where: Record<string, unknown> = {};

        if (filter?.name) {
            where.name = { contains: filter.name, mode: 'insensitive' };
        }
        if (filter?.levels && filter.levels.length > 0) {
            where.level = { in: filter.levels };
        }
        if (filter?.classes && filter.classes.length > 0) {
            where.classIndexes = { hasSome: filter.classes };
        }
        if (filter?.ritual != null) {
            where.ritual = filter.ritual;
        }

        return await prisma.spell.findMany({
            where,
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                level: true,
                schoolIndex: true,
                classIndexes: true,
                description: true,
                higherLevel: true,
                range: true,
                components: true,
                material: true,
                ritual: true,
                duration: true,
                concentration: true,
                castingTime: true,
            },
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}
