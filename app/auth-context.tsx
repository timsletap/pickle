import {
    createUserWithEmailAndPassword,
    deleteUser,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, deleteUserData, readUserData, writeUserData } from "../config/FirebaseConfig";

export type AppUser = {
    uid: string;
    email: string | null;
    username: string | null;
};

type AuthContextType = {
    user: AppUser | null;
    loading: boolean;
    signUp: (email: string, password: string, username: string) => Promise<string | null>;
    signIn: (email: string, password: string) => Promise<string | null>;
    signOut: () => Promise<void>;
    deleteAccount: () => Promise<string | null>;
    updateUsername: (newName: string) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<AppUser | null>(null);

    useEffect(() => {
        let cancelled = false;

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (cancelled) return;

            if (!firebaseUser) {
                setUser(null);
                setLoading(false);
                return;
            }

            setLoading(true);

            const baseUser: AppUser = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                username: null,
            };

            setUser(baseUser);

            (async () => {
                try {
                    const data = await readUserData(firebaseUser.uid);
                    const nameFromDb = typeof data?.username === "string" ? data.username.trim() : "";
                    const resolvedUsername = nameFromDb || null;

                    if (!cancelled) {
                        setUser({ ...baseUser, username: resolvedUsername });
                    }
                } catch (err) {
                    console.error("Failed to read user data for uid", firebaseUser.uid, err);
                    if (!cancelled) {
                        setUser({ ...baseUser, username: null });
                    }
                } finally {
                    if (!cancelled) {
                        setLoading(false);
                    }
                }
            })();
        });

        return () => {
            cancelled = true;
            unsubscribe();
        };
    }, []);

    const signUp = async (email: string, password: string, username: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;

            try {
                await writeUserData(uid, username, email);
            } catch (err) {
                console.error("Failed to write user data for uid", uid, err);
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

    const updateUsername = async (newName: string): Promise<string | null> => {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) return "No signed-in user.";

        try {
            await writeUserData(firebaseUser.uid, newName, firebaseUser.email ?? "");

            // update in-memory user so UI reflects change immediately
            setUser((prev) => (prev ? { ...prev, username: newName } : prev));
            return null;
        } catch (err: any) {
            console.error("Failed to update username", err);
            if (err instanceof Error) return err.message;
            return "Failed to update username.";
        }
    };

    const deleteAccount = async (): Promise<string | null> => {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
            return "No signed-in user.";
        }

        try {
            // Best effort cleanup of app profile record first.
            try {
                await deleteUserData(firebaseUser.uid);
            } catch (err) {
                console.error("Failed to delete user data for uid", firebaseUser.uid, err);
            }

            await deleteUser(firebaseUser);
            return null;
        } catch (error) {
            if (error instanceof Error) {
                // Common Firebase error here is requires-recent-login.
                return error.message;
            }
            return "Failed to delete account.";
        }
    };

    return (
        <AuthContext.Provider value={{ loading, user, signUp, signIn, signOut, deleteAccount, updateUsername }}>
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