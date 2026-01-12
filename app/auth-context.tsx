import {createContext, useContext, useState, useEffect} from "react";
import { User, createUserWithEmailAndPassword, signInWithEmailAndPassword,
signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/FirebaseConfig";


type AuthContextType = {
  //  user: User | null,
    loading: boolean,
    signUp: (email: string, password: string) => Promise<string | null>,
    signIn: (email: string, password: string) => Promise<string | null>,
    signOut: () => Promise<void>,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}) {
    
    const [loading, setLoading] = useState<boolean>(true);
    
    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // You can set user state here if needed
            setLoading(false);
        });

        return unsubscribe;
    }, []);
    
    const signUp = async (email: string, password: string) => {
        // Implement sign-up logic here
        try {
            //generate unique id from firebase
            await createUserWithEmailAndPassword(auth, email, password);
            await signIn(email, password)
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
        <AuthContext.Provider value={{loading, signUp, signIn, signOut }}>
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