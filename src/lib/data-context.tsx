"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Building2, Truck, Users, Plus, Search, Calendar as CalendarIcon, DollarSign, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Freight, Asset, Driver, StandaloneExpense, ExpenseCategory } from "@/lib/types";
import { initialFreight, initialAssets, initialDrivers, initialExpenses } from './data';

type DataContextType = {
    freight: Freight[];
    assets: Asset[];
    drivers: Driver[];
    expenses: StandaloneExpense[];
    setFreight: React.Dispatch<React.SetStateAction<Freight[]>>;
    setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
    setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
    setExpenses: React.Dispatch<React.SetStateAction<StandaloneExpense[]>>;
    restoreItem: (type: 'freight' | 'asset' | 'driver' | 'expense', id: string) => void;
    permanentlyDeleteItem: (type: 'freight' | 'asset' | 'driver' | 'expense', id: string) => void;
    deleteItem: (type: 'freight' | 'asset' | 'driver' | 'expense', id: string) => void;
    restoreLoadExpense: (loadId: string, expenseId: string) => void;
    permanentlyDeleteLoadExpense: (loadId: string, expenseId: string) => void;
    isLoaded: boolean;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [freight, setFreight] = useState<Freight[]>(initialFreight);
    const [assets, setAssets] = useState<Asset[]>(initialAssets);
    const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
    const [expenses, setExpenses] = useState<StandaloneExpense[]>(initialExpenses);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial load - runs only once
    useEffect(() => {
        try {
            const savedFreight = localStorage.getItem('rvt_freight_v7');
            const savedAssets = localStorage.getItem('rvt_assets_v7');
            const savedDrivers = localStorage.getItem('rvt_drivers_v7');
            const savedExpenses = localStorage.getItem('rvt_expenses_v4');

            if (savedFreight) {
                const parsed = JSON.parse(savedFreight);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setFreight(parsed.map((f: any) => ({
                        ...f,
                        date: new Date(f.date),
                        ownerPercentage: f.ownerPercentage ?? 100,
                        ownerAmount: f.ownerAmount ?? (f.lineHaul || 0)
                    })));
                }
            }
            if (savedAssets) {
                const parsed = JSON.parse(savedAssets);
                if (Array.isArray(parsed) && parsed.length > 0) setAssets(parsed);
            }
            if (savedDrivers) {
                const parsed = JSON.parse(savedDrivers);
                if (Array.isArray(parsed) && parsed.length > 0) setDrivers(parsed);
            }
            if (savedExpenses) {
                const parsed = JSON.parse(savedExpenses);
                if (Array.isArray(parsed) && parsed.length > 0) setExpenses(parsed);
            }
        } catch (e) {
            console.error("Failed to load data from localStorage", e);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Save to localStorage - runs whenever data changes, but only after initial load
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('rvt_freight_v7', JSON.stringify(freight));
        }
    }, [freight, isLoaded]);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('rvt_assets_v7', JSON.stringify(assets));
        }
    }, [assets, isLoaded]);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('rvt_drivers_v7', JSON.stringify(drivers));
        }
    }, [drivers, isLoaded]);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('rvt_expenses_v4', JSON.stringify(expenses));
        }
    }, [expenses, isLoaded]);

    const deleteItem = (type: 'freight' | 'asset' | 'driver' | 'expense', id: string) => {
        const deletedAt = new Date().toISOString();
        if (type === 'freight') {
            setFreight(prev => prev.map(f => f.id === id ? { ...f, isDeleted: true, deletedAt } : f));
        } else if (type === 'asset') {
            setAssets(prev => prev.map(a => a.id === id ? { ...a, isDeleted: true, deletedAt } : a));
        } else if (type === 'driver') {
            setDrivers(prev => prev.map(d => d.id === id ? { ...d, isDeleted: true, deletedAt } : d));
        } else if (type === 'expense') {
            setExpenses(prev => prev.map(e => e.id === id ? { ...e, isDeleted: true, deletedAt } : e));
        }
    };

    const restoreItem = (type: 'freight' | 'asset' | 'driver' | 'expense', id: string) => {
        if (type === 'freight') {
            setFreight(prev => prev.map(f => f.id === id ? { ...f, isDeleted: false, deletedAt: undefined } : f));
        } else if (type === 'asset') {
            setAssets(prev => prev.map(a => a.id === id ? { ...a, isDeleted: false, deletedAt: undefined } : a));
        } else if (type === 'driver') {
            setDrivers(prev => prev.map(d => d.id === id ? { ...d, isDeleted: false, deletedAt: undefined } : d));
        } else if (type === 'expense') {
            setExpenses(prev => prev.map(e => e.id === id ? { ...e, isDeleted: false, deletedAt: undefined } : e));
        }
    };

    const permanentlyDeleteItem = (type: 'freight' | 'asset' | 'driver' | 'expense', id: string) => {
        if (type === 'freight') {
            setFreight(prev => prev.filter(f => f.id !== id));
        } else if (type === 'asset') {
            setAssets(prev => prev.filter(a => a.id !== id));
        } else if (type === 'driver') {
            setDrivers(prev => prev.filter(d => d.id !== id));
        } else if (type === 'expense') {
            setExpenses(prev => prev.filter(e => e.id !== id));
        }
    };

    const permanentlyDeleteLoadExpense = (loadId: string, expenseId: string) => {
        setFreight(prev => prev.map(f => f.id === loadId ? {
            ...f,
            expenses: f.expenses.filter(e => e.id !== expenseId)
        } : f));
    };

    const restoreLoadExpense = (loadId: string, expenseId: string) => {
        setFreight(prev => prev.map(f => f.id === loadId ? {
            ...f,
            expenses: f.expenses.map(e => e.id === expenseId ? { ...e, isDeleted: false, deletedAt: undefined } : e)
        } : f));
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
            restoreItem,
            permanentlyDeleteItem,
            deleteItem,
            restoreLoadExpense,
            permanentlyDeleteLoadExpense,
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
