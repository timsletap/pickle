import type { User } from "firebase/auth";
import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, writeUserData } from "../config/FirebaseConfig";


type AuthContextType = {
    user: User | null,
    loading: boolean,
    signUp: (email: string, password: string, username: string) => Promise<string | null>,
    signIn: (email: string, password: string) => Promise<string | null>,
    signOut: () => Promise<void>,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}) {
    
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<User | null>(null);
    
    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });

        return unsubscribe;
    }, []);
    
    const signUp = async (email: string, password: string, username: string) => {
        // Implement sign-up logic here
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;
            // store uid and email in Realtime DB so app can fetch user data by uid later
            try {
                await writeUserData(uid, username, email);
            } catch (err) {
                console.error('Failed to write user data for uid', uid, err);
            }
            return null;
        } catch (error) {
            if (error instanceof Error) {
                return error.message;
            }
            return "An unknown error occurred during sign-up.";
        }
    };

    const signIn = async (email: string, password: string) => {
        // Implement sign-in logic here
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return null;
        } catch (error) {
            if (error instanceof Error) {
                return error.message;
            }
            return "An unknown error occurred during sign-in.";
        }
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
    };
    
    return (
        //Includes user state when needed later
        <AuthContext.Provider value={{loading, user, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}