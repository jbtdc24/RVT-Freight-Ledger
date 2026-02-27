"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Building2, Truck, Users, Plus, Search, Calendar as CalendarIcon, DollarSign, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Freight, Asset, Driver, StandaloneExpense, ExpenseCategory, HomeTransaction, UserMetadata } from "@/lib/types";
import { initialFreight, initialAssets, initialDrivers, initialExpenses } from './data';
import { useAuthContext } from "./contexts/auth-context";
import {
    subscribeToFreight, subscribeToAssets, subscribeToDrivers, subscribeToExpenses, subscribeToHomeTransactions, subscribeToUserMetadata,
    saveFreight, saveAsset, saveDriver, saveExpense as firestoreSaveExpense, saveHomeTransaction as firestoreSaveHome, saveUserMetadata,
    deleteFreight, deleteAsset, deleteDriver, deleteExpense, deleteHomeTransaction as firestoreDeleteHome
} from "./firebase/firestore";

type DataContextType = {
    freight: Freight[];
    assets: Asset[];
    drivers: Driver[];
    expenses: StandaloneExpense[];
    homeTransactions: HomeTransaction[];
    userMetadata: UserMetadata;
    setFreight: React.Dispatch<React.SetStateAction<Freight[]>>;
    setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
    setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
    setExpenses: React.Dispatch<React.SetStateAction<StandaloneExpense[]>>;
    saveExpense: (expense: StandaloneExpense) => Promise<void>;
    saveHomeTransaction: (transaction: HomeTransaction) => Promise<void>;
    deleteHomeTransaction: (id: string) => Promise<void>;
    updateCustomCategories: (module: 'business' | 'home', tab: string, categories: string[]) => Promise<void>;
    deleteItem: (type: 'freight' | 'asset' | 'driver' | 'expense' | 'homeTransaction', id: string) => void;
    deleteLoadExpense: (loadId: string, expenseId: string) => void;
    isLoaded: boolean;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [freight, setFreight] = useState<Freight[]>(initialFreight);
    const [assets, setAssets] = useState<Asset[]>(initialAssets);
    const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
    const [expenses, setExpenses] = useState<StandaloneExpense[]>(initialExpenses);
    const [homeTransactions, setHomeTransactions] = useState<HomeTransaction[]>([]);
    const [userMetadata, setUserMetadata] = useState<UserMetadata>({});
    const [isLoaded, setIsLoaded] = useState(false);
    const { user, loading: authLoading } = useAuthContext();

    // Setup Firestore listeners when a user is authenticated
    useEffect(() => {
        if (!user || authLoading) {
            setFreight([]);
            setAssets([]);
            setDrivers([]);
            setExpenses([]);

            // If we are definitely not loading auth anymore, signal that context data gathering is done
            if (!authLoading) {
                setIsLoaded(true);
            }
            return;
        }

        let isMounted = true;

        const unsubFreight = subscribeToFreight(user.uid, (data) => {
            if (isMounted) setFreight(data);
        });

        const unsubAssets = subscribeToAssets(user.uid, (data) => {
            if (isMounted) setAssets(data);
        });

        const unsubDrivers = subscribeToDrivers(user.uid, (data) => {
            if (isMounted) setDrivers(data);
        });

        const unsubExpenses = subscribeToExpenses(user.uid, (data) => {
            if (isMounted) setExpenses(data);
        });

        const unsubHome = subscribeToHomeTransactions(user.uid, (data) => {
            if (isMounted) setHomeTransactions(data);
        });

        const unsubMetadata = subscribeToUserMetadata(user.uid, (data) => {
            if (isMounted) setUserMetadata(data || {});
        });

        setIsLoaded(true);

        return () => {
            isMounted = false;
            unsubFreight();
            unsubAssets();
            unsubDrivers();
            unsubExpenses();
            unsubHome();
            unsubMetadata();
        };
    }, [user, authLoading]);

    const deleteItem = async (type: 'freight' | 'asset' | 'driver' | 'expense' | 'homeTransaction', id: string) => {
        if (!user) return;

        if (type === 'freight') {
            await deleteFreight(user.uid, id);
        } else if (type === 'asset') {
            await deleteAsset(user.uid, id);
        } else if (type === 'driver') {
            await deleteDriver(user.uid, id);
        } else if (type === 'expense') {
            await deleteExpense(user.uid, id);
        } else if (type === 'homeTransaction') {
            await firestoreDeleteHome(user.uid, id);
        }
    };

    const saveHomeTransaction = async (transaction: HomeTransaction) => {
        if (!user) return;
        await firestoreSaveHome(user.uid, transaction);
    };

    const deleteHomeTransaction = async (id: string) => {
        if (!user) return;
        await firestoreDeleteHome(user.uid, id);
    };

    const updateCustomCategories = async (module: 'business' | 'home', tab: string, categories: string[]) => {
        if (!user) return;
        const newMetadata = { ...userMetadata };
        if (!newMetadata.customCategories) newMetadata.customCategories = {};
        if (!newMetadata.customCategories[module]) newMetadata.customCategories[module] = {};

        newMetadata.customCategories[module]![tab] = categories;
        await saveUserMetadata(user.uid, newMetadata);
    };

    const saveExpense = async (expense: StandaloneExpense) => {
        if (!user) return;
        await firestoreSaveExpense(user.uid, expense);
    };

    const deleteLoadExpense = async (loadId: string, expenseId: string) => {
        if (!user) return;

        const targetLoad = freight.find(f => f.id === loadId);
        if (targetLoad) {
            const updatedLoad = {
                ...targetLoad,
                expenses: targetLoad.expenses.filter(e => e.id !== expenseId)
            };
            // Recalculate totals
            updatedLoad.totalExpenses = updatedLoad.expenses.reduce((acc, exp) => acc + exp.amount, 0);
            updatedLoad.netProfit = (updatedLoad.ownerAmount || 0) - updatedLoad.totalExpenses;

            await saveFreight(user.uid, updatedLoad);
        }
    };

    return (
        <DataContext.Provider value={{
            freight,
            assets,
            drivers,
            expenses,
            homeTransactions,
            userMetadata,
            setFreight,
            setAssets,
            setDrivers,
            setExpenses,
            saveExpense,
            saveHomeTransaction,
            deleteHomeTransaction,
            updateCustomCategories,
            deleteItem,
            deleteLoadExpense,
            isLoaded
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
