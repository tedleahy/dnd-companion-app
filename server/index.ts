import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import {
    startStandaloneServer,
    type StandaloneServerContextFunctionArgument,
} from '@apollo/server/standalone';
import { loadFilesSync } from '@graphql-tools/load-files';
import { getUserIdFromAuthHeader } from './lib/auth';
import type { Resolvers } from './generated/graphql';
import spellsResolver from './resolvers/spellsResolver';
import spellResolver from './resolvers/spellResolver';
import * as spellListResolvers from './resolvers/spellListResolvers';

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
        currentUserSpellLists: spellListResolvers.currentUserLists,
    },

    Mutation: {
        createSpellList: spellListResolvers.create,
        renameSpellList: spellListResolvers.rename,
        deleteSpellList: spellListResolvers.destroy,
        addSpellToList: spellListResolvers.addSpellToList,
        removeSpellFromList: spellListResolvers.removeSpellFromList,
    },

    SpellList: {
        spells: spellListResolvers.spellListSpells,
    },
};

const server = new ApolloServer<Context>({ typeDefs, resolvers });
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context,
});

console.log(`GraphQL running at ${url}`);
