"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    User,
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut
} from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Determine the structure of the data we'll expose
interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    userData: UserData | null; // Our custom user data from Firestore
}

// Custom user data structure (extending standard Firebase Auth user)
export interface UserData {
    uid: string;
    email: string | null;
    displayName: string | null;
    subscriptionTier: "Free" | "Pro" | "Fleet";
    role?: "admin" | "user";
    createdAt: number;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => { },
    signOut: async () => { },
    userData: null,
});

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    // Sync user profile with Firestore database whenever Auth changes
    useEffect(() => {

        // Fallback timeout: If Firebase auth hangs (e.g., missing API keys), stop loading after 5 seconds.
        const timeoutId = setTimeout(() => {
            if (loading) {
                console.warn("Firebase Auth timeout. Check your Firebase config in .env if this persists.");
                setLoading(false);
            }
        }, 5000);

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            clearTimeout(timeoutId);
            setUser(firebaseUser);

            if (firebaseUser) {
                try {
                    // Look up the user's specific data/tier in Firestore
                    const userDocRef = doc(db, "users", firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        setUserData(userDoc.data() as UserData);
                    } else {
                        // If they don't exist in Firestore yet (new signup), create their record
                        const newUserData: UserData = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                            subscriptionTier: "Free", // Default tier is Free
                            createdAt: Date.now(),
                        };
                        await setDoc(userDocRef, newUserData);
                        setUserData(newUserData);
                    }
                } catch (error) {
                    console.error("Error fetching or creating user document in Firestore:", error);
                    setUserData(null);
                }
            } else {
                setUserData(null);
            }

            setLoading(false);
        });

        return () => {
            clearTimeout(timeoutId);
            unsubscribe();
        };
    }, []);

    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            // user sync handled by onAuthStateChanged
        } catch (error) {
            console.error("Error signing in with Google", error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
