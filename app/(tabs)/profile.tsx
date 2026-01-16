import { LinearGradient } from "expo-linear-gradient";
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
      <LinearGradient
        colors={["#000", "#0a1f0a", "#000"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerRow}>
          <Avatar.Text
            size={100}
            label={initials}
            style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}
            labelStyle={{ color: theme.colors.onPrimaryContainer }}
          />

          <View style={styles.nameColumn}>
            <Text style={styles.subtitle}>Signed In As</Text>
            <Text style={styles.headerText}>
              {displayName}
            </Text>

            <Button
              mode="text"
              onPress={() => router.push("/EditingUsername")}
              textColor="#fefefea7"
              style={styles.editInlineButton}
            >
              Edit Username
            </Button>
          </View>
        </View>
      </LinearGradient>

      <View>
        <List.Section>
          <List.Item
            title="Team"
            description="Manage your team"
            right={(props) => <List.Icon {...props} icon="arrow-right" />}
            onPress={() => router.push("/Team")}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
            style={[styles.listItem, { borderColor: 'rgba(0,255,65,0.06)' }]}
          />
          <List.Item
            title="Stats"
            description="View your team statistics"
            right={(props) => <List.Icon {...props} icon="arrow-right" />}
            onPress={() => router.push("/Stats")}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
            style={[styles.listItem, { borderColor: 'rgba(0,255,65,0.06)' }]}
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
    alignItems: "flex-start",
    marginBottom: 8,
  },
  headerGradient: {
    paddingTop: 40,
    paddingHorizontal: 10,
    paddingBottom: 28,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatar: {
    marginRight: 16,
    marginTop: 6,
  },
  nameColumn: {
    flex: 1,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.6,
    marginTop: 8,
    marginBottom: 12,
    flexShrink: 1,
  },
  subtitle: {
    opacity: 0.8,
    marginTop: 8,
    fontSize: 16,
    fontWeight: "400",
    color: "#fdfdfdff",
    letterSpacing: 0.6,
    textShadowColor: "rgba(0, 255, 65, 0.06)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  editInlineButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 0,
    marginLeft: -9,
  },
  listItem: {
    borderWidth: 1,
    borderColor: "rgba(0,255,65,0.06)",
    backgroundColor: "rgba(255,255,255,0.02)",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 8,
  },
  listTitle: {
    color: "#fff",
    fontWeight: "700",
    marginBottom: 6,
    fontSize: 16,
  },
  listDescription: {
    color: "#cfeecf",
    fontSize: 14,
    fontWeight: "400",
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