import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
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
  const { user, deleteAccount, signOut } = useAuth();

  const displayName = (user?.username || "").trim() || "Unknown";
  const initials = getInitials(displayName);

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
      
      <View style={styles.actions}>
         <Button
          mode="outlined"
          onPress={signOut}
          style={[styles.logoutButton, { borderColor: "#00ff41" }]}
          textColor="#00ff41"
        >
          Logout
        </Button>

        <Button
          mode="outlined"
          onPress={deleteAccount}
          style={[styles.deleteButton, { borderColor: theme.colors.error }]}
          textColor={theme.colors.error}
        >
          Delete account
        </Button>
      </View>
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
  listItem: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logoutButton: {
    alignSelf: "flex-start",
    marginTop: 12,
    width: "50%",
  },
  deleteButton: {
    alignSelf: "flex-start",
    marginTop: 12,
    width: "50%",
  },
  actions: {
    gap: 12,
    paddingBottom: 8,
  },
  footer: {
    alignItems: "flex-start",
  },
});