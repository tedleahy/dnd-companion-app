import 'dotenv/config';
import prisma from './prisma/prisma';
import { ApolloServer } from '@apollo/server';
import {
    startStandaloneServer,
    type StandaloneServerContextFunctionArgument,
} from '@apollo/server/standalone';
import { loadFilesSync } from '@graphql-tools/load-files';
import { getUserIdFromAuthHeader, requireUser } from './lib/auth';
import type { Resolvers } from './generated/graphql';
import spellsResolver from './resolvers/spellsResolver';
import spellResolver from './resolvers/spellResolver';

const typeDefs = loadFilesSync('schema.graphql');

export type Context = {
    userId: string | null;
};

async function context({ req }: StandaloneServerContextFunctionArgument): Promise<Context> {
    try {
        const userId = await getUserIdFromAuthHeader(req.headers.authorization);
        return { userId };
    } catch (error) {
        console.error('Invalid auth token', error);
        return { userId: null };
    }
}

const resolvers: Resolvers = {
    Query: {
        spells: spellsResolver,
        spell: spellResolver,
        currentUserSpellLists: async (_parent, _args, ctx) => {
            const userId = requireUser(ctx);

            return prisma.spellList.findMany({
                where: { ownerUserId: userId },
                orderBy: { createdAt: 'asc' },
            });
        },
    },

    Mutation: {
        createSpellList: async (_parent, { name }, ctx) => {
            const userId = requireUser(ctx);

            return await prisma.spellList.create({
                data: {
                    name,
                    ownerUserId: userId,
                }
            })
        },

        renameSpellList: async (_parent, { id, name }, ctx) => {
            const userId = requireUser(ctx);

            const result = await prisma.spellList.updateMany({
                where: {
                    id,
                    ownerUserId: userId,
                },
                data: { name },
            });

            if (result.count === 0) throw new Error('Spell List not found.');

            return true;
        },
    }
};

const server = new ApolloServer<Context>({ typeDefs, resolvers });
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context,
});

console.log(`GraphQL running at ${url}`);
