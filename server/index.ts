import 'dotenv/config'
import prisma from './prisma/prisma';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { loadFilesSync } from '@graphql-tools/load-files';
import { verifyToken } from '@clerk/backend';

const typeDefs = loadFilesSync('schema.graphql');

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
        spell: async (_: unknown, args: { id: string }) => {
            try {
                return await prisma.spell.findUnique({
                    where: { id: args.id },
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
        },
    },
};

type AuthContext = {
    userId: string | null;
    sessionId: string | null;
};

const server = new ApolloServer<AuthContext>({ typeDefs, resolvers });
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req }) => {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.slice('Bearer '.length)
            : undefined;

        if (!token) {
            return { userId: null, sessionId: null };
        }

        try {
            const secretKey = process.env.CLERK_SECRET_KEY;
            if (!secretKey) {
                throw new Error('Missing CLERK_SECRET_KEY in server env.');
            }

            const { payload } = await verifyToken(token, { secretKey });
            const clerkPayload = payload as { sub?: string; sid?: string };
            return {
                userId: clerkPayload.sub ?? null,
                sessionId: clerkPayload.sid ?? null,
            };
        } catch (error) {
            console.error('Failed to verify Clerk token', error);
            return { userId: null, sessionId: null };
        }
    },
});

console.log(`GraphQL running at ${url}`);
