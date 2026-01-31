import { useSignIn } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

export default function SignIn() {
    const { isLoaded, signIn, setActive } = useSignIn();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    async function onSignInPress() {
        if (!isLoaded) return;

        try {
            const signInAttempt = await signIn.create({
                identifier: username,
                password,
            });

            if (signInAttempt.status === 'complete') {
                await setActive({
                    session: signInAttempt.createdSessionId,
                    navigate: async ({ session }) => {
                        if (session?.currentTask) {
                            console.log(session?.currentTask);
                        }
                    },
                });
            } else {
                console.error('Sign in attempt status not complete:');
                console.error(JSON.stringify(signInAttempt, null, 4));
            }
        } catch (error) {
            console.error(JSON.stringify(error, null, 4));
        }
    }

    return (
        <View style={styles.container}>
            <Text variant="displayMedium">Sign In</Text>
            <TextInput
                label="Username"
                value={username}
                onChangeText={(text) => setUsername(text)}
                autoCapitalize="none"
                keyboardType="default"
            />
            <TextInput
                label="Password"
                value={password}
                onChangeText={(text) => setPassword(text)}
                autoCapitalize="none"
                secureTextEntry
            />

            <Button onPress={onSignInPress}>Continue</Button>
            <Text>New here?</Text>
            <Link href="/sign-up">
                <Text variant="bodyMedium">Create an account</Text>
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
