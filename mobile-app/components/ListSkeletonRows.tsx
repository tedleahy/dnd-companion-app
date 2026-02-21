import { StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { fantasyTokens } from '../theme/fantasyTheme';

type ListSkeletonRowsProps = {
    rowCount?: number;
};

export default function ListSkeletonRows({ rowCount = 6 }: ListSkeletonRowsProps) {
    return (
        <View style={styles.skeletonWrapper}>
            {Array.from({ length: rowCount }).map((_, index) => (
                <View key={index} style={styles.skeletonRow} />
            ))}
            <ActivityIndicator size="small" style={styles.skeletonSpinner} />
        </View>
    );
}

const styles = StyleSheet.create({
    skeletonWrapper: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.parchmentDeep,
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingTop: fantasyTokens.spacing.md,
    },
    skeletonRow: {
        height: 56,
        borderRadius: fantasyTokens.radii.sm,
        marginBottom: fantasyTokens.spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(196, 164, 112, 0.45)',
        backgroundColor: 'rgba(246, 233, 207, 0.55)',
    },
    skeletonSpinner: {
        marginTop: fantasyTokens.spacing.sm,
    },
});
