import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from "expo-router";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { Avatar, Button, List, Text, useTheme } from "react-native-paper";
import { useAuth } from "../auth-context";


function getInitials(name: string) {
  const cleaned = (name || "").trim();
  if (!cleaned) return "?";

  const parts = cleaned.split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? "";
  const last = (parts.length > 1 ? parts[parts.length - 1] : "")?.charAt(0) ?? "";

  return (first + last).toUpperCase().slice(0, 2);
}

export default function Profile() {
  const theme = useTheme();
  const { signOut, deleteAccount, user } = useAuth();

  const displayName = (user?.username || "").trim() || "Unknown";
  const initials = getInitials(displayName);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigation will happen automatically when user becomes null
      // Or you can manually navigate:
      router.replace("/auth");
    } catch (error) {
      Alert.alert("Error", "Failed to sign out");
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete account?",
      "This will permanently delete your account and profile data.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const err = await deleteAccount();
            if (err) {
              Alert.alert(
                "Could not delete account",
                err.includes("requires-recent-login")
                  ? "For security, please sign out and sign in again, then try deleting your account."
                  : err
              );
              return;
            }

            router.replace("/auth");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.headerRow}>
          <Avatar.Text
            size={88}
            label={initials}
            style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}
            labelStyle={{ color: theme.colors.onPrimaryContainer }}
          />
          <View style={styles.headerText}>
            <Text variant="headlineLarge" numberOfLines={1}>
              {displayName}
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Signed in
            </Text>
          </View>
        </View>

        <List.Section>
          <List.Item
            title="Team"
            description="Manage your team"
            right={(props) => <List.Icon {...props} icon="arrow-right" />}
            onPress={() => router.push("/Teams")}
            style={[
              styles.listItem,
              { borderTopColor: theme.colors.outline, borderBottomColor: theme.colors.outline },
            ]}
          />
          <List.Item
            title="Stats"
            description="View your team statistics"
            right={(props) => <List.Icon {...props} icon="arrow-right" />}
            onPress={() => router.push("/Stats")}
            style={[
              styles.listItem,
              { borderTopColor: theme.colors.outline, borderBottomColor: theme.colors.outline },
            ]}
          />
        </List.Section>
      </View>
      <TouchableOpacity
        onPress={handleSignOut}
        style={{
          marginTop: 20,
          paddingVertical: 12,
          paddingHorizontal: 16,
          backgroundColor: "#00ff41",
          borderRadius: 20,
          borderWidth: 1,
          justifyContent: "center",
          width: 140,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <MaterialCommunityIcons name="logout" size={18} color="black" style={{ marginRight: 8 }} />
        <Text style={{ color: "black", fontSize: 16, fontWeight: "700", letterSpacing: 0.5 }}>
          Logout
        </Text>
      </TouchableOpacity>

        <Button
          mode="outlined"
          onPress={handleDeleteAccount}
          style={[styles.deleteButton, { borderColor: theme.colors.error }]}
          textColor={theme.colors.error}
        >
          Delete account
        </Button>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#000",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    marginRight: 16,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  subtitle: {
    opacity: 0.75,
    marginTop: 4,
  },
  deleteButton: {
    alignSelf: "flex-start",
    marginTop: 12,
  },
  listItem: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  footer: {
    alignItems: "flex-start",
  },
});