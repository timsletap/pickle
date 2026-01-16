import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, TextInput, IconButton } from "react-native-paper";
import { router } from "expo-router";

//Must hide tab bar, have back arrow that goes back to profile page

export default function EditingUsername() {
    const [editingUsername, setEditingUsername] = useState<string>("");
    const [editFocused, setEditFocused] = useState<boolean>(false);

    return (
        <View style={styles.container}>
            <View style={styles.fieldWrap}>
                    <IconButton
                        icon="arrow-left"
                        size={30}
                        onPress={() => router.push("/profile")}
                        containerColor="transparent"
                        iconColor="#fff"
                    />

                
                <TextInput
                    placeholder="Enter New Username"
                    autoCapitalize="none"
                    keyboardType="default"
                    mode="outlined"
                    outlineColor="rgba(0, 255, 64, 0.7)"
                    activeOutlineColor="#00ff41"
                    textColor="#fff"
                    style={styles.editUser}
                    onChangeText={setEditingUsername}
                    value={editingUsername}
                    onSubmitEditing={() => setEditingUsername(editingUsername)}
                    onFocus={() => setEditFocused(true)}
                    onBlur={() => setEditFocused(false)}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 16,
    },
    editUser: {
        marginBottom: 4,
        width: 240,
        backgroundColor: "rgba(255,255,255,0.05)",
        color: "#fff",
    },
    fieldWrap: {
        marginTop: 18,
        flexDirection: "row",
        alignItems: "center",
    },
    floatingLabel: {
        opacity: 0.8,
        marginTop: 18,
        fontSize: 16,
        fontWeight: "400",
        color: "#fdfdfdff",
        letterSpacing: 0.6,
        textShadowColor: "rgba(0, 255, 65, 0.06)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    editUserFocused: {
        backgroundColor: "rgba(255,255,255,0.02)",
        borderRadius: 12,
        shadowColor: "#00ff41",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 2,
    },
});