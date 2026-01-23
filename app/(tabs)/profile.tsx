import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { useAuth } from "../auth-context";

const colors = {
  background: '#141416',
  backgroundDark: '#0c0c0e',
  primary: '#00a878',
  primaryMuted: 'rgba(0, 168, 120, 0.75)',
  primaryDim: 'rgba(0, 168, 120, 0.12)',
  primaryBorder: 'rgba(0, 168, 120, 0.22)',
  cardBg: 'rgba(0, 168, 120, 0.07)',
  cardBorder: 'rgba(0, 168, 120, 0.18)',
  white: '#f5f5f5',
  textMuted: 'rgba(255, 255, 255, 0.65)',
  textDim: 'rgba(255, 255, 255, 0.4)',
  error: '#f87171',
  errorDim: 'rgba(248, 113, 113, 0.12)',
};

function getInitials(name: string) {
  const cleaned = (name || "").trim();
  if (!cleaned) return "?";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? "";
  const last = (parts.length > 1 ? parts[parts.length - 1] : "")?.charAt(0) ?? "";
  return (first + last).toUpperCase().slice(0, 2);
}

export default function Profile() {
  const { user, deleteAccount, signOut } = useAuth();

  const displayName = (user?.username || "").trim() || "Unknown";
  const initials = getInitials(displayName);

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const menuItems = [
    {
      title: "Team",
      description: "Manage your team roster",
      icon: "people-outline",
      route: "/Team",
    },
    {
      title: "Statistics",
      description: "View performance metrics",
      icon: "stats-chart-outline",
      route: "/Stats",
    },
    {
      title: "Import Data",
      description: "Upload stats from file",
      icon: "cloud-upload-outline",
      route: "/Statistics",
    },
  ];

  return (
    <View style={styles.page}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.headerSubtitle}>PROFILE</Text>
        <Text style={styles.headerTitle}>Account</Text>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <Animated.View
          style={[
            styles.userCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userLabel}>SIGNED IN AS</Text>
            <Text style={styles.userName}>{displayName}</Text>
            <Pressable
              onPress={() => router.push("/EditingUsername")}
              style={({ pressed }) => [
                styles.editButton,
                pressed && styles.editButtonPressed,
              ]}
            >
              <Ionicons name="pencil" size={12} color={colors.primary} />
              <Text style={styles.editButtonText}>Edit Username</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Menu Section */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text style={styles.sectionTitle}>MANAGE</Text>

          {menuItems.map((item, index) => (
            <Pressable
              key={item.title}
              onPress={() => router.push(item.route as any)}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon as any} size={22} color={colors.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
            </Pressable>
          ))}
        </Animated.View>

        {/* Account Actions */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text style={styles.sectionTitle}>ACCOUNT</Text>

          <View style={styles.actionsRow}>
            <Pressable
              onPress={signOut}
              style={({ pressed }) => [
                styles.actionButton,
                styles.actionButtonPrimary,
                pressed && styles.actionButtonPressed,
              ]}
            >
              <Ionicons name="log-out-outline" size={18} color={colors.primary} />
              <Text style={styles.actionButtonTextPrimary}>Sign Out</Text>
            </Pressable>

            <Pressable
              onPress={deleteAccount}
              style={({ pressed }) => [
                styles.actionButton,
                styles.actionButtonDanger,
                pressed && styles.actionButtonPressed,
              ]}
            >
              <Ionicons name="trash-outline" size={18} color={colors.error} />
              <Text style={styles.actionButtonTextDanger}>Delete</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: colors.backgroundDark,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryBorder,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "700",
    letterSpacing: 3,
    marginTop: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.white,
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundDark,
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryDim,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 1,
  },
  userInfo: {
    flex: 1,
  },
  userLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textDim,
    letterSpacing: 2,
    marginBottom: 4,
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.cardBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  editButtonPressed: {
    opacity: 0.7,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textDim,
    letterSpacing: 3,
    marginBottom: 14,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  menuItemPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 13,
    fontWeight: "400",
    color: colors.textMuted,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  actionButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  actionButtonPrimary: {
    backgroundColor: colors.primaryDim,
    borderColor: colors.primaryBorder,
  },
  actionButtonDanger: {
    backgroundColor: colors.errorDim,
    borderColor: colors.error,
  },
  actionButtonTextPrimary: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  actionButtonTextDanger: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.error,
  },
});
