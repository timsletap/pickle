import { getApps, initializeApp } from "firebase/app";
// Use firebase/auth types and functions. Some RN setups require @firebase/auth runtime helpers;
// keep the runtime import but provide the Auth type from the official package for correct typing.
import type { Auth } from "firebase/auth";
//@ts-ignore
import { getAuth, getReactNativePersistence, initializeAuth } from "@firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyA4qT1x2OMofiDoQwMhmWvf4ddrbiXXVDo",
  authDomain: "pickle-cab2c.firebaseapp.com",
  projectId: "pickle-cab2c",
  storageBucket: "pickle-cab2c.firebasestorage.app",
  messagingSenderId: "1082279199176",
  appId: "1:1082279199176:web:dd765bd7307016e19700fd",
  measurementId: "G-D02L7K2K57"
};

// Initialize Firebase - only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth with proper persistence for React Native
// Check if auth is already initialized to avoid the error
let auth: Auth;
try {
  // getAuth may throw if native persistence isn't set up; fall back to initializeAuth
  auth = getAuth(app) as Auth;
} catch {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  }) as Auth;
}

export { auth };

// Initialize Analytics only on web platform where it's supported
if (Platform.OS === "web" && typeof window !== "undefined") {
  import("firebase/analytics").then(({ getAnalytics, isSupported }) => {
    isSupported().then((supported) => {
      if (supported) {
        getAnalytics(app);
      }
    });
  });
}