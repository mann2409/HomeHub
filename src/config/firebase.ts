import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDmc366rZNODfDHbZnmI1mffysWAbR2y60",
  authDomain: "homeboard-7d12b.firebaseapp.com",
  projectId: "homeboard-7d12b",
  storageBucket: "homeboard-7d12b.firebasestorage.app",
  messagingSenderId: "365181179617",
  appId: "1:365181179617:web:ca985fd2082445c24609a0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
