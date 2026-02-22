import type { ApolloError } from '@apollo/client';

export function isUnauthenticatedError(error?: ApolloError): boolean {
    if (!error) return false;

    const graphQLErrorCode = (error.graphQLErrors ?? []).find(
        (graphQLError) => graphQLError.extensions?.code === 'UNAUTHENTICATED'
    );
    if (graphQLErrorCode) return true;

    return error.message.includes('UNAUTHENTICATED');
}
