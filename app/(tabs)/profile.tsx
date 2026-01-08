import {Text, View } from "react-native";
import {Button} from "react-native-paper";
import { router } from "expo-router";

export default function profile(){
    return(
        <View>
        <Text>Profile Page</Text>

            <Button mode="contained" onPress={() => router.replace("/auth")}>
                {"Logout"}
            </Button>
        </View>
    )
}