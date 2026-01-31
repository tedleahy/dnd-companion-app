import { useSignUp } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

export default function SignUp() {
    const { isLoaded, signUp, setActive } = useSignUp();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    async function onSignUpPress() {
        if (!isLoaded) return;

        try {
            const signUpAttempt = await signUp.create({ username, password });

            if (signUpAttempt.status === 'complete') {
                await setActive({
                    session: signUpAttempt.createdSessionId,
                    navigate: async ({ session }) => {
                        if (session?.currentTask) {
                            console.log(session?.currentTask);
                        }
                    },
                });
            } else {
                console.error('Sign up attempt status not complete:');
                console.error(JSON.stringify(signUpAttempt, null, 4));
            }
        } catch (error) {
            console.error(JSON.stringify(error, null, 4));
        }
    }

    return (
        <View style={styles.container}>
            <Text variant="displayMedium">Sign Up</Text>
            <TextInput
                label="Username"
                value={username}
                onChangeText={text => setUsername(text)}
                autoCapitalize="none"
            />
            <TextInput
                label="Password"
                value={password}
                onChangeText={text => setPassword(text)}
                autoCapitalize="none"
                keyboardType="email-address"
                secureTextEntry
            />

            <Button onPress={onSignUpPress}>Continue</Button>
            <Text>Have an account?</Text>
            <Link href="/sign-in">
                <Text variant="bodyMedium">Sign in</Text>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        gap: 12,
    },
});
