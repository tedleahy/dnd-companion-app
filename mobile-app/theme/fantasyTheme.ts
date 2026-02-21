import { MD3DarkTheme, MD3LightTheme, MD3Theme } from 'react-native-paper';

export const fantasyTokens = {
    colors: {
        parchment: '#f6e9cf',
        parchmentDeep: '#f0e0c0',
        inkDark: '#2b1c11',
        inkSoft: '#6e5130',
        ember: '#5f4325',
        gold: '#c4a470',
        crimson: '#7b1e1e',
        night: '#1f1711',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 20,
        xl: 24,
    },
    radii: {
        sm: 12,
        md: 16,
        lg: 18,
    },
    motion: {
        quick: 160,
        standard: 240,
        gentle: 320,
        stagger: 36,
    },
};

export function buildFantasyTheme(colorScheme: string | null | undefined): MD3Theme {
    const base = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;

    return {
        ...base,
        colors: {
            ...base.colors,
            primary: fantasyTokens.colors.crimson,
            secondary: fantasyTokens.colors.gold,
            background: fantasyTokens.colors.night,
            surface: fantasyTokens.colors.parchmentDeep,
            surfaceVariant: fantasyTokens.colors.parchment,
            onBackground: fantasyTokens.colors.parchment,
            onSurface: fantasyTokens.colors.inkDark,
            onSurfaceVariant: fantasyTokens.colors.inkSoft,
            outline: fantasyTokens.colors.gold,
            outlineVariant: '#8e744b',
        },
    };
}
