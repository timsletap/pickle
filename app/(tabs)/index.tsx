import { Text } from "react-native";
import { SafeAreaProvider } from 'react-native-safe-area-context';


export default function Index() {
  // This screen intentionally left simple; post-login redirect
  // is handled in `app/auth.tsx` to send users to the Profile.
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

