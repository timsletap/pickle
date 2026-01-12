import { router } from "expo-router";
import { Alert, Text, View } from "react-native";
import { Button } from "react-native-paper";
import { useAuth } from "../auth-context";

export default function profile(){

    const { signOut, user } = useAuth();
    const handleSignOut = async () => {
    try {
      await signOut();
      // Navigation will happen automatically when user becomes null
      // Or you can manually navigate:
      router.replace("/auth");
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

    return(
        <View>
        <Text>Profile Page</Text>
        <Text style={{ marginBottom: 8 }}>Signed in as: {user?.email ?? 'Unknown'}</Text>

            <Button mode="contained" onPress={handleSignOut}>
                {"Logout"}
            </Button>
        </View>
    )
}