import { collection, doc, query, getDocs, setDoc, deleteDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "./config";
import { Freight, Asset, Driver, StandaloneExpense } from "@/lib/types";

// Helper generic function to get a user's collection reference
const getUserCollection = (userId: string, collectionName: string) => {
    return collection(db, `users/${userId}/${collectionName}`);
};

/**
 * FREIGHT
 */
export const subscribeToFreight = (userId: string, callback: (data: Freight[]) => void) => {
    if (!userId) return () => { };
    const q = query(getUserCollection(userId, "freight"));
    return onSnapshot(q, (snapshot) => {
        const freightData: Freight[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            freightData.push({
                ...data,
                id: doc.id,
                date: data.date?.toDate() || new Date(), // Convert Firestore Timestamp to Date
            } as Freight);
        });
        callback(freightData);
    });
};

export const saveFreight = async (userId: string, freight: Freight) => {
    if (!userId) throw new Error("User ID is required");
    const docRef = doc(getUserCollection(userId, "freight"), freight.id);
    await setDoc(docRef, { ...freight, updatedAt: serverTimestamp() }, { merge: true });
};

export const deleteFreight = async (userId: string, freightId: string) => {
    if (!userId) return;
    const docRef = doc(getUserCollection(userId, "freight"), freightId);
    await deleteDoc(docRef);
};

/**
 * ASSETS
 */
export const subscribeToAssets = (userId: string, callback: (data: Asset[]) => void) => {
    if (!userId) return () => { };
    const q = query(getUserCollection(userId, "assets"));
    return onSnapshot(q, (snapshot) => {
        const assetsData: Asset[] = [];
        snapshot.forEach((doc) => assetsData.push({ ...doc.data(), id: doc.id } as Asset));
        callback(assetsData);
    });
};

export const saveAsset = async (userId: string, asset: Asset) => {
    if (!userId) return;
    const docRef = doc(getUserCollection(userId, "assets"), asset.id);
    await setDoc(docRef, { ...asset, updatedAt: serverTimestamp() }, { merge: true });
};

export const deleteAsset = async (userId: string, assetId: string) => {
    if (!userId) return;
    const docRef = doc(getUserCollection(userId, "assets"), assetId);
    await deleteDoc(docRef);
};

/**
 * DRIVERS
 */
export const subscribeToDrivers = (userId: string, callback: (data: Driver[]) => void) => {
    if (!userId) return () => { };
    const q = query(getUserCollection(userId, "drivers"));
    return onSnapshot(q, (snapshot) => {
        const driversData: Driver[] = [];
        snapshot.forEach((doc) => driversData.push({ ...doc.data(), id: doc.id } as Driver));
        callback(driversData);
    });
};

export const saveDriver = async (userId: string, driver: Driver) => {
    if (!userId) return;
    const docRef = doc(getUserCollection(userId, "drivers"), driver.id);
    await setDoc(docRef, { ...driver, updatedAt: serverTimestamp() }, { merge: true });
};

export const deleteDriver = async (userId: string, driverId: string) => {
    if (!userId) return;
    const docRef = doc(getUserCollection(userId, "drivers"), driverId);
    await deleteDoc(docRef);
};

/**
 * EXPENSES
 */
export const subscribeToExpenses = (userId: string, callback: (data: StandaloneExpense[]) => void) => {
    if (!userId) return () => { };
    const q = query(getUserCollection(userId, "expenses"));
    return onSnapshot(q, (snapshot) => {
        const expensesData: StandaloneExpense[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            expensesData.push({
                ...data,
                id: doc.id,
            } as StandaloneExpense);
        });
        callback(expensesData);
    });
};

export const saveExpense = async (userId: string, expense: StandaloneExpense) => {
    if (!userId) return;
    const docRef = doc(getUserCollection(userId, "expenses"), expense.id);
    await setDoc(docRef, { ...expense, updatedAt: serverTimestamp() }, { merge: true });
};

export const deleteExpense = async (userId: string, expenseId: string) => {
    if (!userId) return;
    const docRef = doc(getUserCollection(userId, "expenses"), expenseId);
    await deleteDoc(docRef);
};
