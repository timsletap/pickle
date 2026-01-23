import { Ionicons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LinearGradient } from "expo-linear-gradient";
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
};

export default function Home() {
  const { user } = useAuth();
  const displayName = (user?.username || "").trim() || "Coach";

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

  const quickActions = [
    {
      title: "Lineups",
      subtitle: "Set your roster",
      icon: "clipboard-list",
      iconType: "fa6",
      route: "/(tabs)/lineups",
      gradient: ["#00a878", "#009068"],
    },
    {
      title: "Chalk Talk",
      subtitle: "Rules & quizzes",
      icon: "chalkboard-teacher",
      iconType: "fa6",
      route: "/(tabs)/chalktalk",
      gradient: ["#009068", "#007858"],
    },
    {
      title: "Dugout",
      subtitle: "Drills & plans",
      icon: "person-shelter",
      iconType: "fa6",
      route: "/(tabs)/dugout",
      gradient: ["#007858", "#006048"],
    },
    {
      title: "Profile",
      subtitle: "Team & stats",
      icon: "user-circle",
      iconType: "fa6",
      route: "/(tabs)/profile",
      gradient: ["#006048", "#004838"],
    },
  ];

  const tips = [
    "Tap a player in Lineups to assign positions",
    "Use Chalk Talk quizzes to test your team's knowledge",
    "Import stats from spreadsheets in your Profile",
    "The Dugout has drills for every skill level",
  ];

  const randomTip = tips[Math.floor(Math.random() * tips.length)];

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
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{displayName}</Text>
          </View>
          <View style={styles.logoContainer}>
            <Ionicons name="baseball" size={28} color={colors.primary} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <Animated.View
          style={[
            styles.heroCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={["#0d0d0d", "#0f1a16", "#0d0d0d"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <View style={styles.brandRow}>
                <Text style={styles.pickleEmoji}>🥒</Text>
                <Text style={styles.heroBrand}>PICKLE</Text>
                <Text style={styles.pickleEmoji}>🥒</Text>
              </View>
              <Text style={styles.heroTagline}>Your team's command center</Text>
              <View style={styles.heroDivider} />
              <Text style={styles.heroTip}>
                <Ionicons name="bulb-outline" size={14} color={colors.primary} /> {randomTip}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text style={styles.sectionTitle}>QUICK ACCESS</Text>

          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <Pressable
                key={action.title}
                onPress={() => router.push(action.route as any)}
                style={({ pressed }) => [
                  styles.actionCard,
                  pressed && styles.actionCardPressed,
                ]}
              >
                <LinearGradient
                  colors={action.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionIconContainer}
                >
                  <FontAwesome6 name={action.icon as any} size={20} color="#000" />
                </LinearGradient>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Features Section */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text style={styles.sectionTitle}>WHAT'S IN THE JAR</Text>

          <View style={styles.featureCard}>
            <View style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Defense Formations</Text>
                <Text style={styles.featureDesc}>Drag-and-drop field positioning</Text>
              </View>
            </View>

            <View style={styles.featureDivider} />

            <View style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name="stats-chart" size={20} color={colors.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Smart Statistics</Text>
                <Text style={styles.featureDesc}>Auto-calculated performance metrics</Text>
              </View>
            </View>

            <View style={styles.featureDivider} />

            <View style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name="school" size={20} color={colors.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Rules & Quizzes</Text>
                <Text style={styles.featureDesc}>Keep your team sharp on the rules</Text>
              </View>
            </View>

            <View style={styles.featureDivider} />

            <View style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name="fitness" size={20} color={colors.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Practice Drills</Text>
                <Text style={styles.featureDesc}>Curated drills for every skill</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Made for coaches, by coaches</Text>
          <View style={styles.footerDots}>
            <View style={styles.dot} />
            <View style={styles.dotLine} />
            <View style={styles.dot} />
          </View>
        </View>
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
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.backgroundDark,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryBorder,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "500",
  },
  userName: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.white,
    letterSpacing: 0.5,
  },
  logoContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryDim,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 28,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  heroGradient: {
    padding: 24,
  },
  heroContent: {
    alignItems: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pickleEmoji: {
    fontSize: 28,
  },
  heroBrand: {
    fontSize: 36,
    fontWeight: "900",
    color: colors.primary,
    letterSpacing: 8,
    marginBottom: 4,
  },
  heroTagline: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "500",
    letterSpacing: 1,
  },
  heroDivider: {
    width: 60,
    height: 2,
    backgroundColor: colors.primaryBorder,
    marginVertical: 16,
    borderRadius: 1,
  },
  heroTip: {
    fontSize: 13,
    color: colors.textDim,
    textAlign: "center",
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textDim,
    letterSpacing: 3,
    marginBottom: 14,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 28,
  },
  actionCard: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  actionCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  featureCard: {
    backgroundColor: colors.backgroundDark,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    color: colors.textMuted,
  },
  featureDivider: {
    height: 1,
    backgroundColor: colors.cardBorder,
  },
  footer: {
    alignItems: "center",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: colors.textDim,
    marginBottom: 12,
  },
  footerDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primaryBorder,
  },
  dotLine: {
    width: 40,
    height: 1,
    backgroundColor: colors.primaryBorder,
  },
});
