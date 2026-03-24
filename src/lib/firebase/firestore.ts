import { 
  collection, 
  doc, 
  query, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp,
  enableNetwork,
  disableNetwork,
  enableIndexedDbPersistence
} from "firebase/firestore";
import { db } from "./config";
import { Freight, Asset, Driver, StandaloneExpense, HomeTransaction, UserMetadata } from "@/lib/types";

// Enable offline persistence (should be called early in app lifecycle)
export const enableOfflinePersistence = async () => {
  try {
    await enableIndexedDbPersistence(db);
    console.log("Firestore offline persistence enabled");
  } catch (err: any) {
    if (err.code === 'failed-precondition') {
      console.warn("Firestore persistence failed: Multiple tabs open");
    } else if (err.code === 'unimplemented') {
      console.warn("Firestore persistence not supported in this browser");
    }
  }
};

// Helper generic function to get a user's collection reference
const getUserCollection = (userId: string, collectionName: string) => {
  return collection(db, `users/${userId}/${collectionName}`);
};

// Helper to strip undefined values from objects (Firestore rejects undefined)
const removeUndefined = (obj: Record<string, any>): Record<string, any> => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefined(item));
  }
  
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    cleaned[key] = removeUndefined(value);
  }
  return cleaned;
};

// Helper to safely convert Firestore data
const safeConvertTimestamp = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === 'string') return new Date(timestamp);
  if (typeof timestamp === 'number') return new Date(timestamp);
  return new Date();
};

/**
 * FREIGHT
 */
export const subscribeToFreight = (userId: string, callback: (data: Freight[]) => void) => {
  if (!userId) {
    console.warn("subscribeToFreight: No userId provided");
    return () => {};
  }
  
  const q = query(getUserCollection(userId, "freight"));
  
  return onSnapshot(
    q, 
    (snapshot) => {
      const freightData: Freight[] = [];
      snapshot.forEach((doc) => {
        try {
          const data = doc.data();
          freightData.push({
            ...data,
            id: doc.id,
            date: safeConvertTimestamp(data.date),
          } as Freight);
        } catch (err) {
          console.error("Error processing freight doc:", doc.id, err);
        }
      });
      callback(freightData);
    },
    (error) => {
      console.error("Error subscribing to freight:", error);
      callback([]);
    }
  );
};

export const saveFreight = async (userId: string, freight: Freight): Promise<void> => {
  if (!userId) {
    console.error("saveFreight: No userId provided");
    throw new Error("User ID is required");
  }
  
  try {
    const collectionRef = getUserCollection(userId, "freight");
    const docRef = freight.id ? doc(collectionRef, freight.id) : doc(collectionRef);
    
    // Ensure date is a proper Date object for Firestore
    const dataToSave = {
      ...freight,
      id: docRef.id,
      date: freight.date instanceof Date ? freight.date : new Date(freight.date),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(docRef, removeUndefined(dataToSave), { merge: true });
    console.log("Freight saved successfully:", docRef.id);
  } catch (error) {
    console.error("Error saving freight:", error);
    throw error;
  }
};

export const deleteFreight = async (userId: string, freightId: string): Promise<void> => {
  if (!userId || !freightId) {
    console.warn("deleteFreight: Missing userId or freightId");
    return;
  }
  
  try {
    const docRef = doc(getUserCollection(userId, "freight"), freightId);
    await deleteDoc(docRef);
    console.log("Freight deleted:", freightId);
  } catch (error) {
    console.error("Error deleting freight:", error);
    throw error;
  }
};

/**
 * ASSETS
 */
export const subscribeToAssets = (userId: string, callback: (data: Asset[]) => void) => {
  if (!userId) {
    console.warn("subscribeToAssets: No userId provided");
    return () => {};
  }
  
  const q = query(getUserCollection(userId, "assets"));
  
  return onSnapshot(
    q,
    (snapshot) => {
      const assetsData: Asset[] = [];
      snapshot.forEach((doc) => {
        try {
          assetsData.push({ ...doc.data(), id: doc.id } as Asset);
        } catch (err) {
          console.error("Error processing asset doc:", doc.id, err);
        }
      });
      callback(assetsData);
    },
    (error) => {
      console.error("Error subscribing to assets:", error);
      callback([]);
    }
  );
};

export const saveAsset = async (userId: string, asset: Asset): Promise<void> => {
  if (!userId) {
    console.error("saveAsset: No userId provided");
    return;
  }
  
  try {
    const collectionRef = getUserCollection(userId, "assets");
    const docRef = asset.id ? doc(collectionRef, asset.id) : doc(collectionRef);
    await setDoc(docRef, removeUndefined({ ...asset, id: docRef.id, updatedAt: serverTimestamp() }), { merge: true });
    console.log("Asset saved:", docRef.id);
  } catch (error) {
    console.error("Error saving asset:", error);
    throw error;
  }
};

export const deleteAsset = async (userId: string, assetId: string): Promise<void> => {
  if (!userId || !assetId) {
    console.warn("deleteAsset: Missing userId or assetId");
    return;
  }
  
  try {
    const docRef = doc(getUserCollection(userId, "assets"), assetId);
    await deleteDoc(docRef);
    console.log("Asset deleted:", assetId);
  } catch (error) {
    console.error("Error deleting asset:", error);
    throw error;
  }
};

/**
 * DRIVERS
 */
export const subscribeToDrivers = (userId: string, callback: (data: Driver[]) => void) => {
  if (!userId) {
    console.warn("subscribeToDrivers: No userId provided");
    return () => {};
  }
  
  const q = query(getUserCollection(userId, "drivers"));
  
  return onSnapshot(
    q,
    (snapshot) => {
      const driversData: Driver[] = [];
      snapshot.forEach((doc) => {
        try {
          driversData.push({ ...doc.data(), id: doc.id } as Driver);
        } catch (err) {
          console.error("Error processing driver doc:", doc.id, err);
        }
      });
      callback(driversData);
    },
    (error) => {
      console.error("Error subscribing to drivers:", error);
      callback([]);
    }
  );
};

export const saveDriver = async (userId: string, driver: Driver): Promise<void> => {
  if (!userId) {
    console.error("saveDriver: No userId provided");
    return;
  }
  
  try {
    const collectionRef = getUserCollection(userId, "drivers");
    const docRef = driver.id ? doc(collectionRef, driver.id) : doc(collectionRef);
    await setDoc(docRef, removeUndefined({ ...driver, id: docRef.id, updatedAt: serverTimestamp() }), { merge: true });
    console.log("Driver saved:", docRef.id);
  } catch (error) {
    console.error("Error saving driver:", error);
    throw error;
  }
};

export const deleteDriver = async (userId: string, driverId: string): Promise<void> => {
  if (!userId || !driverId) {
    console.warn("deleteDriver: Missing userId or driverId");
    return;
  }
  
  try {
    const docRef = doc(getUserCollection(userId, "drivers"), driverId);
    await deleteDoc(docRef);
    console.log("Driver deleted:", driverId);
  } catch (error) {
    console.error("Error deleting driver:", error);
    throw error;
  }
};

/**
 * EXPENSES
 */
export const subscribeToExpenses = (userId: string, callback: (data: StandaloneExpense[]) => void) => {
  if (!userId) {
    console.warn("subscribeToExpenses: No userId provided");
    return () => {};
  }
  
  const q = query(getUserCollection(userId, "expenses"));
  
  return onSnapshot(
    q,
    (snapshot) => {
      const expensesData: StandaloneExpense[] = [];
      snapshot.forEach((doc) => {
        try {
          expensesData.push({ ...doc.data(), id: doc.id } as StandaloneExpense);
        } catch (err) {
          console.error("Error processing expense doc:", doc.id, err);
        }
      });
      callback(expensesData);
    },
    (error) => {
      console.error("Error subscribing to expenses:", error);
      callback([]);
    }
  );
};

export const saveExpense = async (userId: string, expense: StandaloneExpense): Promise<void> => {
  if (!userId) {
    console.error("saveExpense: No userId provided");
    return;
  }
  
  try {
    const collectionRef = getUserCollection(userId, "expenses");
    const docRef = expense.id ? doc(collectionRef, expense.id) : doc(collectionRef);
    await setDoc(docRef, removeUndefined({ ...expense, id: docRef.id, updatedAt: serverTimestamp() }), { merge: true });
    console.log("Expense saved:", docRef.id);
  } catch (error) {
    console.error("Error saving expense:", error);
    throw error;
  }
};

export const deleteExpense = async (userId: string, expenseId: string): Promise<void> => {
  if (!userId || !expenseId) {
    console.warn("deleteExpense: Missing userId or expenseId");
    return;
  }
  
  try {
    const docRef = doc(getUserCollection(userId, "expenses"), expenseId);
    await deleteDoc(docRef);
    console.log("Expense deleted:", expenseId);
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
};

/**
 * HOME TRANSACTIONS
 */
export const subscribeToHomeTransactions = (userId: string, callback: (data: HomeTransaction[]) => void) => {
  if (!userId) {
    console.warn("subscribeToHomeTransactions: No userId provided");
    return () => {};
  }
  
  const q = query(getUserCollection(userId, "homeTransactions"));
  
  return onSnapshot(
    q,
    (snapshot) => {
      const homeData: HomeTransaction[] = [];
      snapshot.forEach((doc) => {
        try {
          homeData.push({ ...doc.data(), id: doc.id } as HomeTransaction);
        } catch (err) {
          console.error("Error processing home transaction doc:", doc.id, err);
        }
      });
      callback(homeData);
    },
    (error) => {
      console.error("Error subscribing to home transactions:", error);
      callback([]);
    }
  );
};

export const saveHomeTransaction = async (userId: string, transaction: HomeTransaction): Promise<void> => {
  if (!userId) {
    console.error("saveHomeTransaction: No userId provided");
    return;
  }
  
  try {
    const collectionRef = getUserCollection(userId, "homeTransactions");
    const docRef = transaction.id ? doc(collectionRef, transaction.id) : doc(collectionRef);
    await setDoc(docRef, removeUndefined({ ...transaction, id: docRef.id, updatedAt: serverTimestamp() }), { merge: true });
    console.log("Home transaction saved:", docRef.id);
  } catch (error) {
    console.error("Error saving home transaction:", error);
    throw error;
  }
};

export const deleteHomeTransaction = async (userId: string, transactionId: string): Promise<void> => {
  if (!userId || !transactionId) {
    console.warn("deleteHomeTransaction: Missing userId or transactionId");
    return;
  }
  
  try {
    const docRef = doc(getUserCollection(userId, "homeTransactions"), transactionId);
    await deleteDoc(docRef);
    console.log("Home transaction deleted:", transactionId);
  } catch (error) {
    console.error("Error deleting home transaction:", error);
    throw error;
  }
};

/**
 * USER METADATA (Custom Categories, etc.)
 */
export const subscribeToUserMetadata = (userId: string, callback: (data: UserMetadata) => void) => {
  if (!userId) {
    console.warn("subscribeToUserMetadata: No userId provided");
    return () => {};
  }
  
  const docRef = doc(getUserCollection(userId, "metadata"), "settings");
  
  return onSnapshot(
    docRef,
    (doc) => {
      try {
        if (doc.exists()) {
          callback(doc.data() as UserMetadata);
        } else {
          callback({});
        }
      } catch (err) {
        console.error("Error processing user metadata:", err);
        callback({});
      }
    },
    (error) => {
      console.error("Error subscribing to user metadata:", error);
      callback({});
    }
  );
};

export const saveUserMetadata = async (userId: string, metadata: UserMetadata): Promise<void> => {
  if (!userId) {
    console.error("saveUserMetadata: No userId provided");
    return;
  }
  
  try {
    const docRef = doc(getUserCollection(userId, "metadata"), "settings");
    await setDoc(docRef, removeUndefined({ ...metadata, updatedAt: serverTimestamp() }), { merge: true });
    console.log("User metadata saved");
  } catch (error) {
    console.error("Error saving user metadata:", error);
    throw error;
  }
};
