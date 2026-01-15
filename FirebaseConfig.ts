// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { Platform } from 'react-native';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

//Firebase analytics (web only)
let getAnalytics: typeof import("firebase/analytics").getAnalytics | undefined;
if (Platform.OS === 'web') {
  getAnalytics = require("firebase/analytics").getAnalytics;
}

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA4qT1x2OMofiDoQwMhmWvf4ddrbiXXVDo",
  authDomain: "pickle-cab2c.firebaseapp.com",
  projectId: "pickle-cab2c",
  storageBucket: "pickle-cab2c.firebasestorage.app",
  messagingSenderId: "1082279199176",
  appId: "1:1082279199176:web:dd765bd7307016e19700fd",
  measurementId: "G-D02L7K2K57"
};

// Initialize Firebase and check if it is web or mobile
const app = initializeApp(firebaseConfig);
let analytics;
if (Platform.OS === 'web' && getAnalytics) {
  analytics = getAnalytics(app);
}

// Initialize and export Firebase Auth instance for app-wide use
export const auth = getAuth(app);