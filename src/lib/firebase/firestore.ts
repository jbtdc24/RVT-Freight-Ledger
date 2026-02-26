import { collection, doc, query, where, getDocs, setDoc, deleteDoc, updateDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db, isMockMode } from "./config";
import { Freight, Asset, Driver, StandaloneExpense } from "@/lib/types";

// Helper generic function to get a user's collection reference
const getUserCollection = (userId: string, collectionName: string) => {
    return collection(db, `users/${userId}/${collectionName}`);
};

/** Mock Subsystem for Demo/Bypass Mode **/
const getMockData = (col: string) => {
    if (typeof window === 'undefined') return [];
    try {
        const item = localStorage.getItem(`mock_${col}`);
        return item ? JSON.parse(item) : [];
    } catch { return []; }
};

const setMockData = (col: string, data: any[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`mock_${col}`, JSON.stringify(data));
    triggerMockUpdate(col, data);
};

const mockListeners: Record<string, ((data: any[]) => void)[]> = {
    freight: [], assets: [], drivers: [], expenses: []
};

const triggerMockUpdate = (col: string, data: any[]) => {
    if (mockListeners[col]) {
        mockListeners[col].forEach(cb => cb(data));
    }
};

/**
 * FREIGHT
 */
export const subscribeToFreight = (userId: string, callback: (data: Freight[]) => void) => {
    if (isMockMode) {
        mockListeners.freight.push(callback);
        callback(getMockData('freight'));
        return () => { mockListeners.freight = mockListeners.freight.filter(cb => cb !== callback); };
    }
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
    if (isMockMode) {
        let items = getMockData('freight');
        const i = items.findIndex((x: any) => x.id === freight.id);
        if (i >= 0) items[i] = { ...items[i], ...freight };
        else items = [freight, ...items];
        setMockData('freight', items);
        return;
    }
    if (!userId) throw new Error("User ID is required");
    const docRef = doc(getUserCollection(userId, "freight"), freight.id);
    await setDoc(docRef, { ...freight, updatedAt: serverTimestamp() }, { merge: true });
};

export const deleteFreight = async (userId: string, freightId: string) => {
    if (isMockMode) {
        let items = getMockData('freight');
        setMockData('freight', items.filter((x: any) => x.id !== freightId));
        return;
    }
    if (!userId) return;
    const docRef = doc(getUserCollection(userId, "freight"), freightId);
    await deleteDoc(docRef);
};

/**
 * ASSETS
 */
export const subscribeToAssets = (userId: string, callback: (data: Asset[]) => void) => {
    if (isMockMode) {
        mockListeners.assets.push(callback);
        callback(getMockData('assets'));
        return () => { mockListeners.assets = mockListeners.assets.filter(cb => cb !== callback); };
    }
    if (!userId) return () => { };
    const q = query(getUserCollection(userId, "assets"));
    return onSnapshot(q, (snapshot) => {
        const assetsData: Asset[] = [];
        snapshot.forEach((doc) => assetsData.push({ ...doc.data(), id: doc.id } as Asset));
        callback(assetsData);
    });
};

export const saveAsset = async (userId: string, asset: Asset) => {
    if (isMockMode) {
        let items = getMockData('assets');
        const i = items.findIndex((x: any) => x.id === asset.id);
        if (i >= 0) items[i] = { ...items[i], ...asset };
        else items = [asset, ...items];
        setMockData('assets', items);
        return;
    }
    if (!userId) return;
    const docRef = doc(getUserCollection(userId, "assets"), asset.id);
    await setDoc(docRef, { ...asset, updatedAt: serverTimestamp() }, { merge: true });
};

export const deleteAsset = async (userId: string, assetId: string) => {
    if (isMockMode) {
        let items = getMockData('assets');
        setMockData('assets', items.filter((x: any) => x.id !== assetId));
        return;
    }
    if (!userId) return;
    const docRef = doc(getUserCollection(userId, "assets"), assetId);
    await deleteDoc(docRef);
};

/**
 * DRIVERS
 */
export const subscribeToDrivers = (userId: string, callback: (data: Driver[]) => void) => {
    if (isMockMode) {
        mockListeners.drivers.push(callback);
        callback(getMockData('drivers'));
        return () => { mockListeners.drivers = mockListeners.drivers.filter(cb => cb !== callback); };
    }
    if (!userId) return () => { };
    const q = query(getUserCollection(userId, "drivers"));
    return onSnapshot(q, (snapshot) => {
        const driversData: Driver[] = [];
        snapshot.forEach((doc) => driversData.push({ ...doc.data(), id: doc.id } as Driver));
        callback(driversData);
    });
};

export const saveDriver = async (userId: string, driver: Driver) => {
    if (isMockMode) {
        let items = getMockData('drivers');
        const i = items.findIndex((x: any) => x.id === driver.id);
        if (i >= 0) items[i] = { ...items[i], ...driver };
        else items = [driver, ...items];
        setMockData('drivers', items);
        return;
    }
    if (!userId) return;
    const docRef = doc(getUserCollection(userId, "drivers"), driver.id);
    await setDoc(docRef, { ...driver, updatedAt: serverTimestamp() }, { merge: true });
};

export const deleteDriver = async (userId: string, driverId: string) => {
    if (isMockMode) {
        let items = getMockData('drivers');
        setMockData('drivers', items.filter((x: any) => x.id !== driverId));
        return;
    }
    if (!userId) return;
    const docRef = doc(getUserCollection(userId, "drivers"), driverId);
    await deleteDoc(docRef);
};

/**
 * EXPENSES
 */
export const subscribeToExpenses = (userId: string, callback: (data: StandaloneExpense[]) => void) => {
    if (isMockMode) {
        mockListeners.expenses.push(callback);
        callback(getMockData('expenses'));
        return () => { mockListeners.expenses = mockListeners.expenses.filter(cb => cb !== callback); };
    }
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
    if (isMockMode) {
        let items = getMockData('expenses');
        const i = items.findIndex((x: any) => x.id === expense.id);
        if (i >= 0) items[i] = { ...items[i], ...expense };
        else items = [expense, ...items];
        setMockData('expenses', items);
        return;
    }
    if (!userId) return;
    const docRef = doc(getUserCollection(userId, "expenses"), expense.id);
    await setDoc(docRef, { ...expense, updatedAt: serverTimestamp() }, { merge: true });
};

export const deleteExpense = async (userId: string, expenseId: string) => {
    if (isMockMode) {
        let items = getMockData('expenses');
        setMockData('expenses', items.filter((x: any) => x.id !== expenseId));
        return;
    }
    if (!userId) return;
    const docRef = doc(getUserCollection(userId, "expenses"), expenseId);
    await deleteDoc(docRef);
};
