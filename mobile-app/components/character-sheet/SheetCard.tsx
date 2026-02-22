import { ReactNode } from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { fantasyTokens } from '@/theme/fantasyTheme';

type SheetCardProps = {
    children: ReactNode;
    index?: number;
    style?: StyleProp<ViewStyle>;
};

/**
 * Parchment-style card container matching the HTML reference design.
 *
 * **React Native learning note:**
 * Unlike CSS where you can use `::before` pseudo-elements for texture overlays,
 * React Native doesn't support pseudo-elements. We achieve the card look purely
 * through background color, border radius, and shadow. The subtle noise texture
 * from the HTML prototype is omitted for now — it could be added later with an
 * `<Image>` overlay or SVG if desired.
 *
 * The `FadeInDown` animation from react-native-reanimated gives each card a
 * staggered entrance animation, similar to the CSS `@keyframes fadeUp` in the
 * HTML prototype.
 */
export default function SheetCard({ children, index = 0, style }: SheetCardProps) {
    return (
        <Animated.View
            entering={FadeInDown
                .duration(fantasyTokens.motion.standard)
                .delay(Math.min(index, 5) * fantasyTokens.motion.stagger)
                .springify()}
            style={[styles.card, style]}
        >
            {children}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: fantasyTokens.colors.cardBg,
        borderRadius: 14,
        overflow: 'hidden',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
    },
});
