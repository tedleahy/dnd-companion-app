import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import SheetCard from './SheetCard';
import SectionLabel from './SectionLabel';

type DeathSavesCardProps = {
    successes: number;
    failures: number;
    onUpdate: (successes: number, failures: number) => void;
};

/**
 * Death saves card with tappable circles for successes and failures.
 *
 * **React Native learning note:**
 * We use `Pressable` instead of `TouchableOpacity` here because Pressable is
 * the newer, more flexible API. Each circle is individually tappable — tapping
 * a hollow circle fills it (increments), tapping a filled circle unfills it
 * (decrements). This gives a natural toggle feel matching the HTML prototype.
 */
export default function DeathSavesCard({ successes, failures, onUpdate }: DeathSavesCardProps) {
    function handleSuccessTap(index: number) {
        const newSuccesses = index < successes ? index : index + 1;
        onUpdate(Math.min(newSuccesses, 3), failures);
    }

    function handleFailureTap(index: number) {
        const newFailures = index < failures ? index : index + 1;
        onUpdate(successes, Math.min(newFailures, 3));
    }

    return (
        <SheetCard index={3}>
            <SectionLabel>Death Saves</SectionLabel>
            <View style={styles.row}>
                <View style={styles.column}>
                    <Text style={styles.columnLabel}>Successes</Text>
                    <View style={styles.circles}>
                        {[0, 1, 2].map((i) => (
                            <Pressable
                                key={i}
                                onPress={() => handleSuccessTap(i)}
                                accessibilityRole="button"
                                accessibilityLabel={`Death save success ${i + 1}`}
                            >
                                <View style={[
                                    styles.circle,
                                    i < successes ? styles.successFilled : styles.circleEmpty,
                                ]} testID={`death-save-success-circle-${i + 1}`} />
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View style={styles.column}>
                    <Text style={styles.columnLabel}>Failures</Text>
                    <View style={styles.circles}>
                        {[0, 1, 2].map((i) => (
                            <Pressable
                                key={i}
                                onPress={() => handleFailureTap(i)}
                                accessibilityRole="button"
                                accessibilityLabel={`Death save failure ${i + 1}`}
                            >
                                <View style={[
                                    styles.circle,
                                    i < failures ? styles.failureFilled : styles.circleEmpty,
                                ]} testID={`death-save-failure-circle-${i + 1}`} />
                            </Pressable>
                        ))}
                    </View>
                </View>
            </View>
        </SheetCard>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 16,
    },
    column: {
        flex: 1,
        alignItems: 'center',
    },
    columnLabel: {
        fontFamily: 'serif',
        fontSize: 9,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: 'rgba(61,43,31,0.45)',
        marginBottom: 8,
    },
    circles: {
        flexDirection: 'row',
        gap: 6,
    },
    circle: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    circleEmpty: {
        borderWidth: 1.5,
        borderColor: fantasyTokens.colors.divider,
    },
    successFilled: {
        backgroundColor: fantasyTokens.colors.greenDark,
        borderWidth: 1.5,
        borderColor: fantasyTokens.colors.greenDark,
    },
    failureFilled: {
        backgroundColor: fantasyTokens.colors.crimson,
        borderWidth: 1.5,
        borderColor: fantasyTokens.colors.crimson,
    },
});
