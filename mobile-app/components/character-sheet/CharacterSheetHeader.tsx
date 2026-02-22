import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

type CharacterSheetHeaderProps = {
    name: string;
    level: number;
    className: string;
    subclass?: string;
    race: string;
    alignment: string;
};

/**
 * Sticky header for the character sheet, matching the HTML reference.
 *
 * Shows the "Character Codex" label, character name, and a subtitle line
 * with level/class/race/alignment. Also renders a visual-only tab bar
 * with "Core" as the active tab (other tabs are placeholders for now).
 *
 * **React Native learning note:**
 * In the HTML prototype this header uses `position: sticky` to stay pinned
 * while the content scrolls. In React Native there's no CSS `position: sticky`.
 * Instead, we keep the header *outside* the ScrollView in the parent layout,
 * so it naturally stays fixed at the top while the ScrollView content scrolls
 * beneath it.
 */
export default function CharacterSheetHeader({
    name,
    level,
    className,
    subclass,
    race,
    alignment,
}: CharacterSheetHeaderProps) {
    const subtitle = `Level ${level} ${className}${subclass ? ` (${subclass})` : ''} · ${race} · ${alignment}`;

    const tabs = ['Core', 'Skills', 'Spells', 'Gear', 'Features'];

    return (
        <View style={styles.header}>
            <Text style={styles.codexLabel}>Character Codex</Text>
            <Text style={styles.charName}>{name}</Text>
            <Text style={styles.charSubtitle}>{subtitle}</Text>

            <View style={styles.tabBar}>
                {tabs.map((tab) => (
                    <View
                        key={tab}
                        style={[styles.tab, tab === 'Core' && styles.tabActive]}
                    >
                        <Text style={[
                            styles.tabText,
                            tab === 'Core' && styles.tabTextActive,
                        ]}>
                            {tab}
                        </Text>
                        {tab === 'Core' && <View style={styles.tabIndicator} />}
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: fantasyTokens.colors.night,
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 0,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(201,146,42,0.2)',
    },
    codexLabel: {
        fontFamily: 'serif',
        fontSize: 9,
        letterSpacing: 3,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.gold,
        opacity: 0.8,
    },
    charName: {
        fontFamily: 'serif',
        fontSize: 28,
        fontWeight: '700',
        color: fantasyTokens.colors.parchment,
        lineHeight: 32,
        letterSpacing: 0.5,
        marginTop: 6,
    },
    charSubtitle: {
        fontFamily: 'serif',
        fontSize: 14,
        color: fantasyTokens.colors.gold,
        marginTop: 2,
        fontStyle: 'italic',
    },
    tabBar: {
        flexDirection: 'row',
        marginTop: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(201,146,42,0.15)',
    },
    tab: {
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 10,
        position: 'relative',
    },
    tabActive: {},
    tabText: {
        fontFamily: 'serif',
        fontSize: 9.5,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: 'rgba(201,146,42,0.5)',
    },
    tabTextActive: {
        color: fantasyTokens.colors.gold,
    },
    tabIndicator: {
        position: 'absolute',
        bottom: -1,
        left: 12,
        right: 12,
        height: 2,
        backgroundColor: fantasyTokens.colors.gold,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
    },
});
