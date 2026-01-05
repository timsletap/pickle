import { useState } from "react";
import { KeyboardAvoidingView, Platform, View, StyleSheet } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";

export default function AuthScreen() {

    //State to track whether user is signing up or signing in
    const [isSignUp, setIsSignUp] = useState<boolean>(false); 
    
    //States to hold email and password inputs
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>("");

    const theme = useTheme();
    
    //Function to handle switching between Sign In and Sign Up modes
    const handleSwitchMode = () => {
        setIsSignUp(!isSignUp);
    }

    //Authentication logic will go here
    const handleAuth = async() => {     
        if (!email || !password) {
            setError("One or more fields are currently empty");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setError(null);
    };

    //So keyboard doesn't cover inputs
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container} //Applies styling from below Stylesheet
        >
            <View style={styles.content}>
                <Text style={styles.title} variant="headlineMedium">User Login</Text>

                <TextInput label="Email" autoCapitalize="none"
                    keyboardType="email-address" placeholder="example@email.com"
                    mode="outlined"
                    style={styles.input}
                    onChangeText={setEmail}
                />

                <TextInput label="Password" autoCapitalize="none"
                    keyboardType="default" mode="outlined"
                    secureTextEntry={true}
                    style={styles.input}
                    onChangeText={setPassword}
                />

                {/* Display error message if exists */}
                {error ? <Text style={{ color: theme.colors.error, marginBottom: 8 }}>{error}</Text> : null}

                <Button mode="contained" style={styles.biggerButton} onPress={handleAuth}>
                    {isSignUp ? "Sign In" : "Sign Up"}
                </Button>
                <Button mode="text" onPress={handleSwitchMode} style={styles.button}>
                    {isSignUp ? "Don't have an account? Sign Up" :
                        "Already have an account? Sign In"}
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