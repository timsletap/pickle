import {Text} from "react-native";
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {getAuth} from "firebase/auth";
import {router} from "expo-router";


export default function Index() {

  // Routes back to auth if no user is logged in
  // May be unnecessary
  getAuth().onAuthStateChanged((user) => {
    if(!user) router.replace("/auth");
  });
  
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

