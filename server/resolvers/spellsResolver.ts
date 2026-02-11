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
        return await prisma.spell.findMany({
            where: args.filter?.name
                ? { name: { contains: args.filter.name, mode: 'insensitive' } }
                : undefined,
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
