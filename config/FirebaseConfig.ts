import { initializeApp } from "firebase/app";
//@ts-ignore
import { initializeAuth, getReactNativePersistence } from "@firebase/auth";
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with proper persistence for React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

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