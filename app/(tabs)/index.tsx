import {Text } from "react-native";
import {SafeAreaProvider} from 'react-native-safe-area-context';
export default function Index() {
  return (
    <SafeAreaProvider
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </SafeAreaProvider>
  );
}

