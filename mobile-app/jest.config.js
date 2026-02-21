/** @type {import('jest').Config} */
module.exports = {
    preset: 'jest-expo',
    setupFilesAfterEnv: ['./jest-setup.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|react-native-paper|react-native-vector-icons|@expo/vector-icons|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|@react-native-async-storage/async-storage|react-native-url-polyfill|@supabase/.*|rxjs)',
    ],
};
