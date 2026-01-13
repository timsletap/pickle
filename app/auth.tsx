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

    const theme = useTheme();
    
    //Function to handle switching between Sign In and Sign Up modes
    const handleSwitchMode = () => {
        setIsSignUp(!isSignUp);
    }

    //Authentication logic: sign in or sign up via Firebase (using AuthContext)
    const { signUp, signIn } = useAuth();

    const handleAuth = async() => {     
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
            <View style={styles.content}>
                <Text style={styles.title} variant="headlineMedium">{isSignUp ? "Create Account" : "User Login"}</Text>

                <TextInput label="Email" autoCapitalize="none"
                    keyboardType="email-address" placeholder="example@email.com"
                    mode="outlined"
                    style={styles.input}
                    onChangeText={setEmail}
                    value={email}
                />

                {isSignUp ? (
                    <TextInput label="Username" autoCapitalize="none"
                        mode="outlined"
                        style={styles.input}
                        onChangeText={setUsername}
                        value={username}
                    />
                ) : null}

                <TextInput label="Password" autoCapitalize="none"
                    keyboardType="default" mode="outlined"
                    secureTextEntry
                    style={styles.input}
                    onChangeText={setPassword}
                    value={password}
                />

                {/* Style & Display error message if exists */}
                {error ? <Text style={{ color: theme.colors.error, marginBottom: 8 }}>{error}</Text> : null}

                <Button mode="contained" style={styles.biggerButton} onPress={handleAuth}>
                    {isSignUp ? "Sign Up" : "Sign In"}
                </Button>
                <Button mode="text" onPress={handleSwitchMode} style={styles.button}>
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
        backgroundColor: "#03ca2bff",
        padding: 20,
        borderRadius: 8,
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
    },

    biggerButton: {
        fontSize: 24,
        marginTop: 8,
        backgroundColor: "#03ca2bff",
        borderColor: "#000000ff",
        borderWidth: 1,
        padding: 12,
    },

    button: {
        marginTop: 12,
    },

});