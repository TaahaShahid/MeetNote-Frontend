import { db } from "./firebase";
import { collection, query, getDocs, orderBy, Timestamp, doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";

export interface Session {
    id: string;
    title: string;
    summary?: string;
    transcript?: string;
    created_at: Timestamp | Date;
    status: string;
    analysis?: any;
}

export const getSessions = async (userId: string): Promise<Session[]> => {
    if (!userId) return [];

    try {
        const q = query(
            collection(db, "users", userId, "meetings"),
            orderBy("created_at", "desc")
        );

        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Session));
    } catch (error) {
        console.error("Error fetching sessions:", error);
        return [];
    }
};

export const getSession = async (userId: string, sessionId: string): Promise<Session | null> => {
    if (!userId || !sessionId) return null;

    try {
        const docRef = doc(db, "users", userId, "meetings", sessionId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            } as Session;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching session:", error);
        return null;
    }
}

export const initializeUser = async (userId: string, email: string | null, displayName: string | null) => {
    if (!userId) return;
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            await setDoc(userRef, {
                email: email || "",
                displayName: displayName || "",
                minutes_balance: 100,
                created_at: new Date()
            });
        }
    } catch (error) {
        console.error("Error initializing user:", error);
    }
};

export const getUserData = async (userId: string) => {
    if (!userId) return null;
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return userSnap.data();
        }
        return null;
    } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
    }
};

export const topUpMinutes = async (userId: string, addedMinutes: number) => {
    if (!userId) return;
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            minutes_balance: increment(addedMinutes)
        });
    } catch (error) {
        console.error("Error topping up minutes:", error);
        throw error;
    }
};
