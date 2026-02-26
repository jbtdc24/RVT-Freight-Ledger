"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Building2, Truck, Users, Plus, Search, Calendar as CalendarIcon, DollarSign, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Freight, Asset, Driver, StandaloneExpense, ExpenseCategory } from "@/lib/types";
import { initialFreight, initialAssets, initialDrivers, initialExpenses } from './data';
import { useAuthContext } from "./contexts/auth-context";
import { subscribeToFreight, subscribeToAssets, subscribeToDrivers, subscribeToExpenses, saveFreight, saveAsset, saveDriver, saveExpense, deleteFreight, deleteAsset, deleteDriver, deleteExpense } from "./firebase/firestore";

type DataContextType = {
    freight: Freight[];
    assets: Asset[];
    drivers: Driver[];
    expenses: StandaloneExpense[];
    setFreight: React.Dispatch<React.SetStateAction<Freight[]>>;
    setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
    setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
    setExpenses: React.Dispatch<React.SetStateAction<StandaloneExpense[]>>;
    deleteItem: (type: 'freight' | 'asset' | 'driver' | 'expense', id: string) => void;
    deleteLoadExpense: (loadId: string, expenseId: string) => void;
    isLoaded: boolean;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [freight, setFreight] = useState<Freight[]>(initialFreight);
    const [assets, setAssets] = useState<Asset[]>(initialAssets);
    const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
    const [expenses, setExpenses] = useState<StandaloneExpense[]>(initialExpenses);
    const [isLoaded, setIsLoaded] = useState(false);
    const { user, loading: authLoading } = useAuthContext();

    // Setup Firestore listeners when a user is authenticated
    useEffect(() => {
        if (!user || authLoading) {
            setFreight([]);
            setAssets([]);
            setDrivers([]);
            setExpenses([]);
            setIsLoaded(false);
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

        setIsLoaded(true);

        return () => {
            isMounted = false;
            unsubFreight();
            unsubAssets();
            unsubDrivers();
            unsubExpenses();
        };
    }, [user, authLoading]);

    const deleteItem = async (type: 'freight' | 'asset' | 'driver' | 'expense', id: string) => {
        if (!user) return;

        if (type === 'freight') {
            await deleteFreight(user.uid, id);
        } else if (type === 'asset') {
            await deleteAsset(user.uid, id);
        } else if (type === 'driver') {
            await deleteDriver(user.uid, id);
        } else if (type === 'expense') {
            await deleteExpense(user.uid, id);
        }
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
            setFreight,
            setAssets,
            setDrivers,
            setExpenses,
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
