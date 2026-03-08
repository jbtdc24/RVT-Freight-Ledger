import { collection, doc, query, getDocs, setDoc, deleteDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "./config";
import { Freight, Asset, Driver, StandaloneExpense, HomeTransaction } from "@/lib/types";

// Helper generic function to get a user's collection reference
const getUserCollection = (userId: string, collectionName: string) => {
    return collection(db, `users/${userId}/${collectionName}`);
};

// Helper to strip undefined values from objects (Firestore rejects undefined)
const removeUndefined = (obj: Record<string, any>): Record<string, any> => {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value === undefined) continue;
        if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
            cleaned[key] = removeUndefined(value);
        } else if (Array.isArray(value)) {
            cleaned[key] = value.map(item =>
                item !== null && typeof item === 'object' && !(item instanceof Date)
                    ? removeUndefined(item)
                    : item
            );
        } else {
            cleaned[key] = value;
        }
    }
    return cleaned;
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
    const collectionRef = getUserCollection(userId, "freight");
    const docRef = freight.id ? doc(collectionRef, freight.id) : doc(collectionRef);
    await setDoc(docRef, removeUndefined({ ...freight, id: docRef.id, updatedAt: serverTimestamp() }), { merge: true });
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
    const collectionRef = getUserCollection(userId, "assets");
    const docRef = asset.id ? doc(collectionRef, asset.id) : doc(collectionRef);
    await setDoc(docRef, removeUndefined({ ...asset, id: docRef.id, updatedAt: serverTimestamp() }), { merge: true });
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
    const collectionRef = getUserCollection(userId, "drivers");
    const docRef = driver.id ? doc(collectionRef, driver.id) : doc(collectionRef);
    await setDoc(docRef, removeUndefined({ ...driver, id: docRef.id, updatedAt: serverTimestamp() }), { merge: true });
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
    const collectionRef = getUserCollection(userId, "expenses");
    const docRef = expense.id ? doc(collectionRef, expense.id) : doc(collectionRef);
    await setDoc(docRef, removeUndefined({ ...expense, id: docRef.id, updatedAt: serverTimestamp() }), { merge: true });
};

export const deleteExpense = async (userId: string, expenseId: string) => {
    if (!userId) return;
    const docRef = doc(getUserCollection(userId, "expenses"), expenseId);
    await deleteDoc(docRef);
};

/**
 * HOME TRANSACTIONS
 */
export const subscribeToHomeTransactions = (userId: string, callback: (data: HomeTransaction[]) => void) => {
    if (!userId) return () => { };
    const q = query(getUserCollection(userId, "homeTransactions"));
    return onSnapshot(q, (snapshot) => {
        const data: HomeTransaction[] = [];
        snapshot.forEach((doc) => {
            data.push({ ...doc.data(), id: doc.id } as HomeTransaction);
        });
        callback(data);
    });
};

export const saveHomeTransaction = async (userId: string, transaction: HomeTransaction) => {
    if (!userId) return;
    const collectionRef = getUserCollection(userId, "homeTransactions");
    const docRef = transaction.id ? doc(collectionRef, transaction.id) : doc(collectionRef);
    await setDoc(docRef, removeUndefined({ ...transaction, id: docRef.id, updatedAt: serverTimestamp() }), { merge: true });
};

export const deleteHomeTransaction = async (userId: string, transactionId: string) => {
    if (!userId) return;
    const docRef = doc(getUserCollection(userId, "homeTransactions"), transactionId);
    await deleteDoc(docRef);
};
