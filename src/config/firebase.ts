import { initializeApp, getApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_VIBECODE_FIREBASE_API_KEY || "AIzaSyB5hh0-j7QRW5X-USnIN8az8MshmvvkK8s",
  authDomain: process.env.EXPO_PUBLIC_VIBECODE_FIREBASE_AUTH_DOMAIN || "homeboard-7d12b.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_VIBECODE_FIREBASE_PROJECT_ID || "homeboard-7d12b",
  storageBucket: process.env.EXPO_PUBLIC_VIBECODE_FIREBASE_STORAGE_BUCKET || "homeboard-7d12b.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_VIBECODE_FIREBASE_MESSAGING_SENDER_ID || "365181179617",
  appId: process.env.EXPO_PUBLIC_VIBECODE_FIREBASE_APP_ID || "1:365181179617:ios:dbc7677d724b412d4609a0"
};

// Initialize Firebase
let app;
let auth;
let db;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  db = getFirestore(app);
} else {
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };
export default auth;

