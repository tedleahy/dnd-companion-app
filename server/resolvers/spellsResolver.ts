import type { Context } from "..";
import type { QuerySpellsArgs } from "../generated/graphql";
import { requireUser } from "../lib/auth";
import { buildWhere } from "../lib/spellFilters";
import prisma from "../prisma/prisma";

export default async function spellsResolver(
    _parent: unknown,
    args: Partial<QuerySpellsArgs>,
    ctx: Context,
) {
    requireUser(ctx);

    try {
        const where = buildWhere(args.filter);

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
                sourceBook: true,
            },
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}
