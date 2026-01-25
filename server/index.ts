import 'dotenv/config'
import prisma from './prisma/prisma';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const typeDefs = `#graphql
    type Spell {
        id: ID!
        name: String!
        level: Int!
        schoolIndex: String!
        classIndexes: [String!]!
    }

    input SpellFilter {
        name: String
    }

    type Query {
        spells(filter: SpellFilter): [Spell!]!
    }
`;

const resolvers = {
    Query: {
        spells: async (_: unknown, args: { filter?: { name?: string } }) => {
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
                    },
                });
            } catch (error) {
                console.error(error);
                throw error;
            }
        },
    },
};

const server = new ApolloServer({ typeDefs, resolvers });
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 }
});

console.log(`GraphQL running at ${url}`);
