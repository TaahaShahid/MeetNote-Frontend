"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    User,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { initializeUser, getUserData } from "../lib/firestore";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    minutesBalance: number;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    refreshMinutes: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    minutesBalance: 0,
    signInWithGoogle: async () => { },
    logout: async () => { },
    refreshMinutes: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [minutesBalance, setMinutesBalance] = useState(0);

    const refreshMinutes = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const data = await getUserData(uid);
        if (data && typeof data.minutes_balance === 'number') {
            setMinutesBalance(data.minutes_balance);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                await initializeUser(user.uid, user.email, user.displayName);
                const data = await getUserData(user.uid);
                if (data && typeof data.minutes_balance === 'number') {
                    setMinutesBalance(data.minutes_balance);
                }
            } else {
                setMinutesBalance(0);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google", error);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, minutesBalance, signInWithGoogle, logout, refreshMinutes }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
