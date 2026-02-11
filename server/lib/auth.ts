import { createRemoteJWKSet, jwtVerify } from 'jose';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ISSUER = `${SUPABASE_URL}/auth/v1`;

const jwks = createRemoteJWKSet(new URL(`${SUPABASE_ISSUER}/.well-known/jwks.json`));

export async function getUserIdFromAuthHeader(authHeader?: string): Promise<string | null> {
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.slice('Bearer '.length);
    const { payload } = await jwtVerify(token, jwks, { issuer: SUPABASE_ISSUER });

    return typeof payload.sub === 'string' ? payload.sub : null;
}

export function requireUser(ctx: { userId: string | null }): string {
    if (!ctx.userId) throw new Error('UNAUTHENTICATED');
    return ctx.userId;
}
