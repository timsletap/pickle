import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, IconButton, Text, TextInput } from "react-native-paper";
import { useAuth } from "../auth-context";

//Must hide tab bar, have back arrow that goes back to profile page

export default function EditingUsername() {
    const { user, updateUsername } = useAuth();
    const [editingUsername, setEditingUsername] = useState<string>(user?.username ?? "");
    const [editFocused, setEditFocused] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [updated, setUpdated] = useState<boolean>(false);

    const doUpdate = async () => {
        setError(null);
        if (!user) return;
        const newName = editingUsername.trim();
        if (newName.length < 6) {
            setError("Username must be at least 6 characters.");
            return;
        }
        if (user.username && newName === user.username) {
            setError("New username must be different from your current username.");
            return;
        }

        setSaving(true);
        try {
            const err = await updateUsername(newName);
            setSaving(false);
            if (!err) {
                // success: show confirmation, clear input, then navigate back after a short delay
                setUpdated(true);
                setEditingUsername("");
                setTimeout(() => {
                    setUpdated(false);
                    router.back();
                }, 900);
            } else {
                setError(err);
            }
        } catch (err) {
            setSaving(false);
            console.error("Failed to update username", err);
            setError("Failed to update username.");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.fieldWrap}>
                <IconButton
                    icon="arrow-left"
                    size={30}
                    onPress={() => router.push("/profile")}
                    containerColor="transparent"
                    iconColor="#fff"
                    style={styles.backIcon}
                />

                <View style={styles.inputColumn}>
                    <View style={styles.inputRow}>
                        <TextInput
                            placeholder="Enter New Username"
                            autoCapitalize="none"
                            keyboardType="default"
                            mode="outlined"
                            outlineColor="rgba(0, 255, 64, 0.7)"
                            activeOutlineColor="#00ff41"
                            textColor="#fff"
                            style={styles.editUser}
                            onChangeText={(t) => { setEditingUsername(t); if (error) setError(null); if (updated) setUpdated(false); }}
                            value={editingUsername}
                            onFocus={() => setEditFocused(true)}
                            onBlur={() => setEditFocused(false)}
                            onSubmitEditing={doUpdate}
                        />

                        <Button mode="contained" onPress={doUpdate} style={styles.updateButton} labelStyle={styles.updateLabel} disabled={saving}>
                            Update
                        </Button>
                    </View>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    {updated ? <Text style={styles.updatedText}>Username Updated!</Text> : null}
                </View>
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
        marginLeft: -13,
        marginRight: 14,
        width: 200,
        backgroundColor: "rgba(255,255,255,0.05)",
        color: "#fff",
    },
    inputColumn: {
        flex: 1,
        marginLeft: 4,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    updateButton: {
        marginLeft: 8,
        backgroundColor: '#00ff41',
    },
    updateLabel: {
        color: '#000',
        fontWeight: '700',
    },
    updatedText: {
        color: '#00ff41',
        marginTop: 8,
    },
    errorText: {
        color: '#ff6b6b',
        marginTop: 8,
    },
    backIcon: {
        position: 'absolute',
        left: -10,
        zIndex: 10,
    },
    fieldWrap: {
        marginTop: 18,
        flexDirection: "row",
        alignItems: "center",
        position: 'relative',
        paddingLeft: 56,
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