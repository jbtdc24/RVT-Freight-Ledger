"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Freight, Asset, Driver } from './types';
import { initialFreight, initialAssets, initialDrivers } from './data';

type DataContextType = {
    freight: Freight[];
    assets: Asset[];
    drivers: Driver[];
    setFreight: React.Dispatch<React.SetStateAction<Freight[]>>;
    setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
    setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
    restoreItem: (type: 'freight' | 'asset' | 'driver', id: string) => void;
    permanentlyDeleteItem: (type: 'freight' | 'asset' | 'driver', id: string) => void;
    deleteItem: (type: 'freight' | 'asset' | 'driver', id: string) => void;
    isLoaded: boolean;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [freight, setFreight] = useState<Freight[]>(initialFreight);
    const [assets, setAssets] = useState<Asset[]>(initialAssets);
    const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial load - runs only once
    useEffect(() => {
        try {
            const savedFreight = localStorage.getItem('rvt_freight');
            const savedAssets = localStorage.getItem('rvt_assets');
            const savedDrivers = localStorage.getItem('rvt_drivers');

            if (savedFreight) setFreight(JSON.parse(savedFreight).map((f: any) => ({ ...f, date: new Date(f.date) })));
            if (savedAssets) setAssets(JSON.parse(savedAssets));
            if (savedDrivers) setDrivers(JSON.parse(savedDrivers));
        } catch (e) {
            console.error("Failed to load data from localStorage", e);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Save to localStorage - runs whenever data changes, but only after initial load
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('rvt_freight', JSON.stringify(freight));
        }
    }, [freight, isLoaded]);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('rvt_assets', JSON.stringify(assets));
        }
    }, [assets, isLoaded]);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('rvt_drivers', JSON.stringify(drivers));
        }
    }, [drivers, isLoaded]);

    const deleteItem = (type: 'freight' | 'asset' | 'driver', id: string) => {
        const deletedAt = new Date().toISOString();
        if (type === 'freight') {
            setFreight(prev => prev.map(f => f.id === id ? { ...f, isDeleted: true, deletedAt } : f));
        } else if (type === 'asset') {
            setAssets(prev => prev.map(a => a.id === id ? { ...a, isDeleted: true, deletedAt } : a));
        } else if (type === 'driver') {
            setDrivers(prev => prev.map(d => d.id === id ? { ...d, isDeleted: true, deletedAt } : d));
        }
    };

    const restoreItem = (type: 'freight' | 'asset' | 'driver', id: string) => {
        if (type === 'freight') {
            setFreight(prev => prev.map(f => f.id === id ? { ...f, isDeleted: false, deletedAt: undefined } : f));
        } else if (type === 'asset') {
            setAssets(prev => prev.map(a => a.id === id ? { ...a, isDeleted: false, deletedAt: undefined } : a));
        } else if (type === 'driver') {
            setDrivers(prev => prev.map(d => d.id === id ? { ...d, isDeleted: false, deletedAt: undefined } : d));
        }
    };

    const permanentlyDeleteItem = (type: 'freight' | 'asset' | 'driver', id: string) => {
        if (type === 'freight') {
            setFreight(prev => prev.filter(f => f.id !== id));
        } else if (type === 'asset') {
            setAssets(prev => prev.filter(a => a.id !== id));
        } else if (type === 'driver') {
            setDrivers(prev => prev.filter(d => d.id !== id));
        }
    };

    return (
        <DataContext.Provider value={{
            freight,
            assets,
            drivers,
            setFreight,
            setAssets,
            setDrivers,
            restoreItem,
            permanentlyDeleteItem,
            deleteItem,
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
