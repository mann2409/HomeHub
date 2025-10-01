// Temporarily disabled Firebase configuration
// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDmc366rZNODfDHbZnmI1mffysWAbR2y60",
  authDomain: "homeboard-7d12b.firebaseapp.com",
  projectId: "homeboard-7d12b",
  storageBucket: "homeboard-7d12b.firebasestorage.app",
  messagingSenderId: "365181179617",
  appId: "1:365181179617:web:ca985fd2082445c24609a0"
};

// Mock Firebase exports for development
const auth = null;
const db = null;
const app = null;

export { auth, db };
export default app;
