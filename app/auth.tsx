import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import { useAuth } from "./auth-context";

export default function AuthScreen() {

    //State to track whether user is signing up or signing in
    const [isSignUp, setIsSignUp] = useState<boolean>(false);

    //States to hold email, username and password inputs
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    // Focus state to show floating labels
    const [emailFocused, setEmailFocused] = useState<boolean>(false);
    const [passwordFocused, setPasswordFocused] = useState<boolean>(false);
    const [usernameFocused, setUsernameFocused] = useState<boolean>(false);

    const theme = useTheme();

    //Function to handle switching between Sign In and Sign Up modes
    const handleSwitchMode = () => {
        setIsSignUp(!isSignUp);
    }

    //Authentication logic: sign in or sign up via Firebase (using AuthContext)
    const { signUp, signIn } = useAuth();

    const handleAuth = async () => {
        setError(null);

        if (!email || !password || (isSignUp && !username)) {
            setError("One or more fields are currently empty");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        try {
            if (isSignUp) {
                const errMsg = await signUp(email, password, username);
                if (errMsg) {
                    setError("Sign up failed: " + errMsg);
                    return;
                }
            } else {
                const errMsg = await signIn(email, password);
                if (errMsg) {
                    setError("Sign in failed: " + errMsg);
                    return;
                }
            }
            // On success navigate to Profile inside the tabs group
            router.replace("/(tabs)/profile");
        } catch (err: any) {
            setError("Authentication failed: " + err.message);
        }
    };


    return (
        <KeyboardAvoidingView   //So keyboard doesn't cover inputs
            behavior={Platform.OS === "ios" ? "padding" : "height"}    //Makes room for keyboard
            style={styles.container} //Applies styling from below Stylesheet
        >
            <LinearGradient
                colors={["#000", "#0a1f0a", "#000"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
            >
                <Text style={styles.headerTitle}>{isSignUp ? "Create Account" : "Welcome Back"}</Text>
                <Text style={styles.headerSubtitle}>{isSignUp ? "Create your account to get started" : "Sign in to continue"}</Text>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.fieldWrap}>
                    {(emailFocused || email) ? <Text>Email</Text> : null}
                    <TextInput
                        placeholder="Email"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        mode="outlined"
                        outlineColor="rgba(0,255,64,0.7)"
                        activeOutlineColor="#00ff41"
                        textColor="#fff"
                        style={styles.input}
                        onChangeText={setEmail}
                        value={email}
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                    />
                </View>

                {isSignUp ? (
                    <View style={styles.fieldWrap}>
                        {(usernameFocused || username) ? <Text>Username</Text> : null}
                        <TextInput
                            placeholder="Username"
                            autoCapitalize="none"
                            keyboardType="default"
                            mode="outlined"
                            outlineColor="rgba(0, 255, 64, 0.7)"
                            activeOutlineColor="#00ff41"
                            textColor="#fff"
                            style={styles.input}
                            onChangeText={setUsername}
                            value={username}
                            onFocus={() => setUsernameFocused(true)}
                            onBlur={() => setUsernameFocused(false)}
                        />
                    </View>
                ) : null}

                <View style={styles.fieldWrap}>
                    {(passwordFocused || password) ? <Text>Password</Text> : null}
                    <TextInput
                        placeholder="Password"
                        autoCapitalize="none"
                        mode="outlined"
                        secureTextEntry
                        outlineColor="rgba(0, 255, 64, 0.7)"
                        activeOutlineColor="#00ff41"
                        textColor="#fff"
                        style={styles.input}
                        onChangeText={setPassword}
                        value={password}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                    />
                </View>

                {/* Style & Display error message if exists */}
                {error ? <Text style={{ color: theme.colors.error, marginBottom: 8 }}>{error}</Text> : null}

                <Button mode="contained" style={styles.biggerButton} onPress={handleAuth} textColor="#000">
                    {isSignUp ? "Sign Up" : "Sign In"}
                </Button>
                <Button mode="text" onPress={handleSwitchMode} style={styles.button} textColor="#00ff41">
                    {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                </Button>

            </View>

        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#000000ff"
    },

    content: {
        flex: 1,
        backgroundColor: "rgba(10,10,10,0.85)",
        padding: 20,
        borderRadius: 12,
        marginTop: 12,
        borderColor: "rgba(0,255,65,0.06)",
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },

    title: {
        textAlign: "center",
        marginBottom: 16,
    },

    input: {
        marginBottom: 16,
        backgroundColor: "transparent",
    },

    biggerButton: {
        fontSize: 18,
        marginTop: 8,
        backgroundColor: "#00ff41",
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        alignItems: "center",
        justifyContent: "center",
    },

    button: {
        marginTop: 12,
    },
    headerGradient: {
        paddingTop: 56,
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    headerTitle: {
        color: "#ffffff",
        fontSize: 28,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 14,
    },
    headerSubtitle: {
        color: "rgba(255,255,255,0.85)",
        fontSize: 13,
        textAlign: "center",
        marginBottom: 2,
        fontWeight: "400",
    },

    fieldWrap: {
        marginBottom: 8,
    },

});