import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { hpPercentage } from '@/lib/characterSheetUtils';
import SheetCard from './SheetCard';
import SectionLabel from './SectionLabel';
import CardDivider from './CardDivider';

type VitalsCardProps = {
    hp: { current: number; max: number; temp: number };
    ac: number;
    speed: number;
    conditions: string[];
};

export default function VitalsCard({ hp, ac, speed, conditions }: VitalsCardProps) {
    const hpPct = hpPercentage(hp.current, hp.max);

    return (
        <SheetCard index={0}>
            <SectionLabel>Vitals</SectionLabel>

            <View style={styles.vitalsRow}>
                <View style={styles.vitalBlock}>
                    <Text style={[styles.vitalValue, styles.hpColor]}>
                        {hp.current}{' '}
                        <Text style={styles.hpMax}>/ {hp.max}</Text>
                    </Text>
                    <Text style={styles.vitalLabel}>Hit Points</Text>
                    {hp.temp > 0 && (
                        <Text style={styles.vitalSub}>+{hp.temp} temp</Text>
                    )}
                </View>

                <View style={[styles.vitalBlock, styles.vitalBlockBorder, { paddingLeft: 7}]}>
                    <Text style={[styles.vitalValue, styles.acColor]}>{ac}</Text>
                    <Text style={styles.vitalLabel}>Armour Class</Text>
                </View>

                <View style={[styles.vitalBlock, styles.vitalBlockBorder]}>
                    <Text style={[styles.vitalValue, styles.speedColor]}>
                        {speed}
                        <Text style={styles.vitalSub}>ft</Text>
                    </Text>
                    <Text style={styles.vitalLabel}>Speed</Text>
                </View>
            </View>

            <View style={styles.hpBarWrap}>
                <View style={styles.hpBarTrack}>
                    <View style={[styles.hpBarFill, { width: `${hpPct}%` }]} />
                </View>
            </View>

            <CardDivider />

            <View style={styles.conditionRow}>
                {conditions.length > 0 ? (
                    conditions.map((condition) => (
                        <View key={condition} style={styles.conditionTag}>
                            <Text style={styles.conditionText}>{condition}</Text>
                        </View>
                    ))
                ) : (
                    <View style={[styles.conditionTag, styles.conditionNone]}>
                        <Text style={styles.conditionTextNone}>No conditions</Text>
                    </View>
                )}
            </View>
        </SheetCard>
    );
}

const styles = StyleSheet.create({
    vitalsRow: {
        flexDirection: 'row',
        paddingHorizontal: 18,
        paddingTop: 14,
        paddingBottom: 18,
        gap: 10,
    },
    vitalBlock: {
        flex: 1,
        alignItems: 'center',
    },
    vitalBlockBorder: {
        borderLeftWidth: 1,
        borderLeftColor: fantasyTokens.colors.divider,
    },
    vitalValue: {
        fontFamily: 'serif',
        fontSize: 32,
        fontWeight: '700',
        color: fantasyTokens.colors.inkDark,
        lineHeight: 36,
    },
    hpColor: {
        color: fantasyTokens.colors.crimson,
    },
    hpMax: {
        fontSize: 16,
        opacity: 0.45,
        color: fantasyTokens.colors.crimson,
    },
    acColor: {
        color: fantasyTokens.colors.greenDark,
    },
    speedColor: {
        color: fantasyTokens.colors.blueDark,
    },
    vitalLabel: {
        fontFamily: 'serif',
        fontSize: 10,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.inkLight,
        opacity: 0.6,
        marginTop: 4,
    },
    vitalSub: {
        fontFamily: 'serif',
        fontSize: 11,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.5,
        marginTop: 2,
    },
    hpBarWrap: {
        paddingHorizontal: 18,
        paddingBottom: 14,
    },
    hpBarTrack: {
        height: 6,
        backgroundColor: 'rgba(139,26,26,0.15)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    hpBarFill: {
        height: '100%',
        backgroundColor: fantasyTokens.colors.crimson,
        borderRadius: 3,
    },
    conditionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 14,
    },
    conditionTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.crimson,
        backgroundColor: 'rgba(139,26,26,0.08)',
    },
    conditionText: {
        fontFamily: 'serif',
        fontSize: 8,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.crimson,
    },
    conditionNone: {
        borderColor: fantasyTokens.colors.divider,
        backgroundColor: 'transparent',
    },
    conditionTextNone: {
        fontFamily: 'serif',
        fontSize: 8,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: 'rgba(61,43,31,0.4)',
    },
});
