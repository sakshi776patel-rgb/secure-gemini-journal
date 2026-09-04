import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD1t_sCcIpdAtjE_qWOnZumbp2e0VOcYqs",
  authDomain: "gemini--journal-791e8.firebaseapp.com",
  projectId: "gemini--journal-791e8",
  storageBucket: "gemini--journal-791e8.firebasestorage.app",
  messagingSenderId: "351686048655",
  appId: "1:351686048655:web:e9cb468b10d11bfd2ce9fa"
};

// Prevent duplicate initialization
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const signInWithGoogle = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);

export const db = getFirestore(app);