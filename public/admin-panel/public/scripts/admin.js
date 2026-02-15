// This file contains the JavaScript logic for the admin panel. It handles Firebase authentication, image uploads to Firebase Storage, and CRUD operations for dog data in Firebase Firestore. It also manages the dynamic updates of the homepage and available-dogs page.

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Login function
async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Logged in:", userCredential.user);
        // Redirect to dashboard or update UI
    } catch (error) {
        console.error("Login error:", error);
    }
}

// Logout function
async function logout() {
    try {
        await signOut(auth);
        console.log("Logged out");
        // Redirect to login or update UI
    } catch (error) {
        console.error("Logout error:", error);
    }
}

// Add dog function
async function addDog(dogData) {
    try {
        const docRef = await addDoc(collection(db, "dogs"), dogData);
        console.log("Dog added with ID:", docRef.id);
    } catch (error) {
        console.error("Error adding dog:", error);
    }
}

// Fetch dogs function
async function fetchDogs() {
    const dogsCollection = collection(db, "dogs");
    const dogSnapshot = await getDocs(dogsCollection);
    const dogList = dogSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return dogList;
}

// Delete dog function
async function deleteDog(dogId) {
    try {
        await deleteDoc(doc(db, "dogs", dogId));
        console.log("Dog deleted with ID:", dogId);
    } catch (error) {
        console.error("Error deleting dog:", error);
    }
}

// Export functions for use in other modules
export { login, logout, addDog, fetchDogs, deleteDog };