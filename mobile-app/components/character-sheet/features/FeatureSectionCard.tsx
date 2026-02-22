import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { availableUses, rechargeLabel } from '@/lib/featuresTabUtils';
import type { FeatureRow } from '@/components/character-sheet/features/features.types';
import CardDivider from '../CardDivider';
import PipTrack from '../PipTrack';
import SectionLabel from '../SectionLabel';
import SheetCard from '../SheetCard';

/**
 * Props for a grouped feature section card.
 */
type FeatureSectionCardProps = {
    title: string;
    features: FeatureRow[];
    emptyText: string;
    category: 'class' | 'racial' | 'feat';
    index: number;
};

/**
 * Visual icon metadata for a feature category.
 */
type IconStyle = {
    label: string;
    backgroundColor: string;
};

/**
 * Returns the icon label/color for a given feature category.
 */
function iconStyle(category: FeatureSectionCardProps['category']): IconStyle {
    if (category === 'racial') {
        return { label: 'R', backgroundColor: 'rgba(26,74,26,0.1)' };
    }

    if (category === 'feat') {
        return { label: 'F', backgroundColor: 'rgba(26,42,74,0.1)' };
    }

    return { label: 'C', backgroundColor: 'rgba(139,26,26,0.1)' };
}

/**
 * Builds the uses summary label for tracked-use features.
 */
function usesLabel(feature: FeatureRow): string {
    if (!feature.usesMax || feature.usesMax <= 0) return '';
    return `${availableUses(feature)} / ${feature.usesMax}`;
}

/**
 * Displays a titled list of class, racial, or feat features.
 */
export default function FeatureSectionCard({
    title,
    features,
    emptyText,
    category,
    index,
}: FeatureSectionCardProps) {
    const icon = iconStyle(category);

    return (
        <SheetCard index={index}>
            <SectionLabel>{title}</SectionLabel>

            {features.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>{emptyText}</Text>
                </View>
            ) : (
                <View style={styles.list}>
                    {features.map((feature, featureIndex) => {
                        const showUseTracker = Boolean(feature.usesMax && feature.usesMax > 0);
                        const recharge = rechargeLabel(feature.recharge);

                        return (
                            <View key={feature.id}>
                                <View style={styles.row}>
                                    <View style={[styles.iconWrap, { backgroundColor: icon.backgroundColor }]}>
                                        <Text style={styles.iconLabel}>{icon.label}</Text>
                                    </View>

                                    <View style={styles.content}>
                                        <Text style={styles.featureName}>{feature.name}</Text>
                                        <Text style={styles.featureSource}>{feature.source}</Text>

                                        {feature.description.trim().length > 0 && (
                                            <Text style={styles.featureDescription}>{feature.description}</Text>
                                        )}

                                        {showUseTracker && (
                                            <View style={styles.useRow}>
                                                <PipTrack
                                                    count={feature.usesMax ?? 0}
                                                    filledCount={availableUses(feature)}
                                                    filledColor={fantasyTokens.colors.crimson}
                                                    emptyBorderColor="rgba(139,26,26,0.3)"
                                                    size={11}
                                                    gap={4}
                                                    borderWidth={1.3}
                                                    disabled
                                                />
                                                <Text style={styles.useLabel}>{usesLabel(feature)}</Text>
                                                {recharge && (
                                                    <View style={styles.rechargeBadge}>
                                                        <Text style={styles.rechargeBadgeText}>{recharge}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        )}
                                    </View>
                                </View>
                                {featureIndex < features.length - 1 && <CardDivider />}
                            </View>
                        );
                    })}
                </View>
            )}
        </SheetCard>
    );
}

/** Styles for feature section rows, labels, and badges. */
const styles = StyleSheet.create({
    list: {
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 14,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingVertical: 11,
    },
    iconWrap: {
        width: 34,
        height: 34,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    iconLabel: {
        fontFamily: 'serif',
        fontSize: 13,
        fontWeight: '700',
        color: fantasyTokens.colors.inkDark,
    },
    content: {
        flex: 1,
        minWidth: 0,
    },
    featureName: {
        fontFamily: 'serif',
        fontSize: 13,
        fontWeight: '600',
        color: fantasyTokens.colors.inkDark,
        lineHeight: 17,
    },
    featureSource: {
        fontFamily: 'serif',
        fontSize: 11,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.45,
        fontStyle: 'italic',
        marginTop: 2,
    },
    featureDescription: {
        fontFamily: 'serif',
        fontSize: 12.5,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.75,
        lineHeight: 18,
        marginTop: 6,
    },
    useRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    useLabel: {
        fontFamily: 'serif',
        fontSize: 10,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.5,
    },
    rechargeBadge: {
        marginLeft: 'auto',
        borderRadius: 10,
        backgroundColor: 'rgba(139,90,43,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    rechargeBadgeText: {
        fontFamily: 'serif',
        fontSize: 8,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.inkLight,
        opacity: 0.65,
    },
    emptyState: {
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 16,
    },
    emptyStateText: {
        fontFamily: 'serif',
        fontSize: 12,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.6,
        fontStyle: 'italic',
    },
});
