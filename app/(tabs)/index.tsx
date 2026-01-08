import { SafeAreaView, Text, View } from "react-native";
import { Link } from "expo-router";
import {auth} from "../../FirebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"; 


export default function Index() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>

    </SafeAreaView>
  );
}
