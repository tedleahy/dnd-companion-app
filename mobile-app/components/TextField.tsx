import { fantasyTokens } from "@/theme/fantasyTheme";
import { KeyboardTypeOptions, StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";

type Props = {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    keyboardType?: KeyboardTypeOptions;
    placeholder?: string;
    secureTextEntry?: boolean;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

export default function TextField({
    label,
    value,
    onChangeText,
    keyboardType,
    placeholder,
    secureTextEntry,
    autoCapitalize = 'none',
}: Props) {
    return (
        <TextInput
            label={label}
            value={value}
            placeholder={placeholder}
            secureTextEntry={secureTextEntry}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            mode="outlined"
            style={styles.input}
            textColor={fantasyTokens.colors.inkDark}
            outlineColor={fantasyTokens.colors.gold}
            activeOutlineColor={fantasyTokens.colors.crimson}
        />
    );
}

const styles = StyleSheet.create({
    input: {
        marginBottom: fantasyTokens.spacing.sm,
        backgroundColor: fantasyTokens.colors.parchment,
    },
});
