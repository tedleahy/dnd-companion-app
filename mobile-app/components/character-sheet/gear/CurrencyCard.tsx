import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { Currency } from '@/types/generated_graphql_types';
import { fantasyTokens } from '@/theme/fantasyTheme';
import SectionLabel from '../SectionLabel';
import SheetCard from '../SheetCard';

type CurrencyCardProps = {
    currency: Currency;
};

type CurrencyKey = 'cp' | 'sp' | 'ep' | 'gp' | 'pp';

const CURRENCY_FIELDS: readonly { key: CurrencyKey; label: string }[] = [
    { key: 'cp', label: 'CP' },
    { key: 'sp', label: 'SP' },
    { key: 'ep', label: 'EP' },
    { key: 'gp', label: 'GP' },
    { key: 'pp', label: 'PP' },
];

export default function CurrencyCard({ currency }: CurrencyCardProps) {
    return (
        <SheetCard index={0}>
            <SectionLabel>Currency</SectionLabel>
            <View style={styles.currencyRow}>
                {CURRENCY_FIELDS.map((field) => (
                    <View key={field.key} style={styles.currencyItem}>
                        <Text
                            style={[
                                styles.currencyAmount,
                                field.key === 'gp' && styles.currencyAmountGold,
                            ]}
                            testID={`currency-${field.key}-amount`}
                        >
                            {currency[field.key]}
                        </Text>
                        <Text style={styles.currencyLabel}>{field.label}</Text>
                    </View>
                ))}
            </View>
        </SheetCard>
    );
}

const styles = StyleSheet.create({
    currencyRow: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 16,
    },
    currencyItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: 4,
        paddingVertical: 10,
    },
    currencyAmount: {
        fontFamily: 'serif',
        fontSize: 18,
        fontWeight: '700',
        color: fantasyTokens.colors.inkDark,
        lineHeight: 20,
    },
    currencyAmountGold: {
        color: fantasyTokens.colors.gold,
    },
    currencyLabel: {
        fontFamily: 'serif',
        fontSize: 8,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.gold,
        opacity: 0.8,
        marginTop: 2,
    },
});
