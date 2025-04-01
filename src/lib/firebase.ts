
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, query, where, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBPrd0HT20eM6ceZnE17nI2jUDamKyHn2s",
  authDomain: "codeglimpse-650e6.firebaseapp.com",
  projectId: "codeglimpse-650e6",
  storageBucket: "codeglimpse-650e6.firebasestorage.app",
  messagingSenderId: "169349614802",
  appId: "1:169349614802:web:e5a3c9c994fe0a641bb10b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable logging in development
if (process.env.NODE_ENV !== 'production') {
  console.log('Firebase initialized with config:', firebaseConfig);
}

// Currency configuration
export const DEFAULT_CURRENCY = "INR";

export { 
  auth, 
  db, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail, // Ensure this is exported
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  deleteDoc,
  addDoc,
  serverTimestamp
};
