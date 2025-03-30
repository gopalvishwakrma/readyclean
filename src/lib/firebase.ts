
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, query, where, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAeqmmQPi4dyVA3yA7Gpxewa_OHXewUYpU",
  authDomain: "bookhaven-rental.firebaseapp.com",
  projectId: "bookhaven-rental",
  storageBucket: "bookhaven-rental.appspot.com",
  messagingSenderId: "484489397624",
  appId: "1:484489397624:web:9bfd2a5b99e909c5b7432c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { 
  auth, 
  db, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
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
