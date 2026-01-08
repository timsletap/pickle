// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize and export Firebase Auth instance for app-wide use
export const auth = getAuth(app);