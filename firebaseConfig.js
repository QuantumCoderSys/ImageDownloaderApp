import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDisOpw0e79iAQRJlDxqm8HL3qy3kFhWJk",
  authDomain: "imagescroller-c3336.firebaseapp.com",
  projectId: "imagescroller-c3336",
  storageBucket: "imagescroller-c3336.appspot.com",
  messagingSenderId: "138610929585",
  appId: "1:138610929585:web:1:138610929585:ios:d87129df9d1793e8331790",
};

// Initialize Firebase App
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage for persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db }; // Export Firestore instance