import { Tabs } from 'expo-router';
import { fantasyTokens } from '@/theme/fantasyTheme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: fantasyTokens.colors.night,
                    borderTopColor: fantasyTokens.colors.gold,
                    borderTopWidth: 1,
                },
                tabBarActiveTintColor: fantasyTokens.colors.gold,
                tabBarInactiveTintColor: fantasyTokens.colors.inkSoft,
                tabBarLabelStyle: {
                    fontFamily: 'serif',
                    fontSize: 12,
                },
            }}
        >
            <Tabs.Screen
                name="spells"
                options={{
                    title: 'Spells',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="book-open-variant" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="spell-lists"
                options={{
                    title: 'Spell Lists',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="bookmark-multiple" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
