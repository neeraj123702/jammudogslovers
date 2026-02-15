import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { app } from "../auth/firebase";

const auth = getAuth(app);

export const login = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        throw new Error(error.message);
    }
};

export const isAuthenticated = () => {
    return auth.currentUser !== null;
};