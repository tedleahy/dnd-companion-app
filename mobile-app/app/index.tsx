import { Text, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';

export default function Index() {
    return (
        <PaperProvider>
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Text>Edit app/index.tsx to edit this screen.</Text>
            </View>
        </PaperProvider>
    );
}
