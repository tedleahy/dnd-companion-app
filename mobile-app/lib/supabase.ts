import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * Supabase stores different keys:
 *  - `sb-<project>-auth-token` (large)
 *  - refresh/metadata keys (small)
 *
 * We route large blobs to AsyncStorage because they're too big for SecureStorage's 2Kb limit
 */
const SupabaseStorage = {
    getItem: async (key: string) => key.includes('auth-token')
        ? AsyncStorage.getItem(key)
        : SecureStore.getItemAsync(key),

    setItem: async (key: string, value: string) => key.includes('auth-token')
        ? AsyncStorage.setItem(key, value)
        : SecureStore.setItemAsync(key, value),

    removeItem: async (key: string) => key.includes('auth-token')
        ? AsyncStorage.removeItem(key)
        : SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
        auth: {
            storage: SupabaseStorage,
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false,
        },
    }
);
