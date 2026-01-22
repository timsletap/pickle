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
        colors={["#000000", "#001a00", "#002200", "#001a00", "#000000"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <LinearGradient
          colors={["transparent", "rgba(0, 255, 65, 0.05)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGlow}
        />

        <View style={styles.headerRow}>
          <Avatar.Text
            size={100}
            label={initials}
            style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}
            labelStyle={{ color: theme.colors.onPrimaryContainer }}
          />

          <View style={styles.nameColumn}>
            <Text style={styles.subtitle}>Signed in as</Text>
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

      <View style={styles.contentArea}>
        <View style={styles.glassSection}>
          <List.Section>
            <List.Item
              title="Team"
              description="Manage your team"
              right={(props) => <List.Icon {...props} icon="arrow-right" />}
              onPress={() => router.push("/Team")}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
              style={styles.listItem}
            />
            <List.Item
              title="Stats"
              description="View your team statistics"
              right={(props) => <List.Icon {...props} icon="arrow-right" />}
              onPress={() => router.push("/Stats")}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
              style={styles.listItem}
            />
            <List.Item
              title="Import Stats"
              description="Attach file for data extraction"
              right={(props) => <List.Icon {...props} icon="arrow-right" />}
              onPress={() => router.push("/Statistics")}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
              style={styles.listItem}
            />
          </List.Section>
        </View>
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
    paddingTop: 8,
  },
  headerGradient: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#00ff41",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  avatar: {
    marginRight: 16,
    marginTop: 6,
  },
  nameColumn: {
    flex: 1,
  },
  headerText: {
    minWidth: 0,
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.6,
    marginTop: 8,
    flexShrink: 1,
  },
  subtitle: {
    opacity: 0.8,
    marginTop: 18,
    fontSize: 16,
    fontWeight: "400",
    color: "#fdfdfdff",
    letterSpacing: 0.6,
    textShadowColor: "rgba(0, 255, 65, 0.12)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  editInlineButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 0,
    marginLeft: -9,
  },
  listItem: {
    borderWidth: 1.5,
    borderColor: "rgba(0,255,65,0.18)",
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: "#00ff41",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 6,
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
  headerGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  contentArea: {
    paddingTop: 18,
  },
  glassSection: {
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1.5,
    borderColor: "rgba(0,255,65,0.18)",
    shadowColor: "#00ff41",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 8,
  },
});