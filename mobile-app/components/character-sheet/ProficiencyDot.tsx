import { StyleSheet, View } from 'react-native';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { ProficiencyLevel } from '@/types/generated_graphql_types';

type ProficiencyDotProps = {
    level: ProficiencyLevel;
};

/**
 * Visual indicator for proficiency state, matching the HTML reference:
 * - `none` — hollow circle with divider-colored border
 * - `proficient` — filled crimson circle
 * - `expert` — gold outer ring with card-bg inner, creating a double-ring effect
 */
export default function ProficiencyDot({ level }: ProficiencyDotProps) {
    if (level === 'expert') {
        return (
            <View style={styles.expertOuter}>
                <View style={styles.expertInner} />
            </View>
        );
    }

    if (level === 'proficient') {
        return <View style={[styles.dot, styles.proficient]} />;
    }

    return <View style={[styles.dot, styles.none]} />;
}

const styles = StyleSheet.create({
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    none: {
        borderWidth: 1.5,
        borderColor: fantasyTokens.colors.divider,
    },
    proficient: {
        backgroundColor: fantasyTokens.colors.crimson,
    },
    expertOuter: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: fantasyTokens.colors.goldLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    expertInner: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: fantasyTokens.colors.cardBg,
    },
});
