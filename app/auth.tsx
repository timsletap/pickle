import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { useAuth } from "./auth-context";

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

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { signUp, signIn } = useAuth();

  // Simple entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
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

  const handleSwitchMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
  };

  const handleAuth = async () => {
    setError(null);

    if (!email || !password || (isSignUp && !username)) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      if (isSignUp) {
        const errMsg = await signUp(email, password, username);
        if (errMsg) {
          setError(errMsg);
          return;
        }
      } else {
        const errMsg = await signIn(email, password);
        if (errMsg) {
          setError(errMsg);
          return;
        }
      }
      router.replace("/(tabs)/home");
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    }
  };

  return (
    <View style={styles.page}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
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
          <Text style={styles.headerSubtitle}>PICKLE</Text>
          <Text style={styles.headerTitle}>
            {isSignUp ? "Create Account" : "Welcome Back"}
          </Text>
        </Animated.View>

        {/* Form Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={colors.textDim}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              cursorColor={colors.primary}
              selectionColor={colors.primaryDim}
            />
          </View>

          {/* Username Field (Sign Up only) */}
          {isSignUp && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>USERNAME</Text>
              <TextInput
                style={styles.input}
                placeholder="Choose a username"
                placeholderTextColor={colors.textDim}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                cursorColor={colors.primary}
                selectionColor={colors.primaryDim}
              />
            </View>
          )}

          {/* Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={colors.textDim}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              cursorColor={colors.primary}
              selectionColor={colors.primaryDim}
            />
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Submit Button */}
          <Pressable
            onPress={handleAuth}
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.submitButtonPressed,
            ]}
          >
            <LinearGradient
              colors={[colors.primary, '#009068', colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitButtonGradient}
            >
              <Text style={styles.submitButtonText}>
                {isSignUp ? "Create Account" : "Sign In"}
              </Text>
            </LinearGradient>
          </Pressable>

          {/* Switch Mode */}
          <Pressable onPress={handleSwitchMode} style={styles.switchButton}>
            <Text style={styles.switchText}>
              {isSignUp
                ? "Already have an account? "
                : "Don't have an account? "}
              <Text style={styles.switchTextHighlight}>
                {isSignUp ? "Sign In" : "Sign Up"}
              </Text>
            </Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "700",
    letterSpacing: 3,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.white,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: colors.backgroundDark,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.cardBg,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.white,
    fontWeight: "500",
  },
  errorBox: {
    backgroundColor: colors.errorDim,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  submitButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 4,
  },
  submitButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: colors.backgroundDark,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1,
  },
  switchButton: {
    marginTop: 20,
    alignItems: "center",
  },
  switchText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  switchTextHighlight: {
    color: colors.primary,
    fontWeight: "700",
  },
});
