import type { Freight, LoadExpense, Asset, Driver } from "./types";

const freight1Expenses: LoadExpense[] = [
  { id: 'exp-1-1', category: 'Fuel', description: 'Fuel stop 1', amount: 450.25 },
  { id: 'exp-1-2', category: 'Fuel', description: 'Fuel stop 2', amount: 400.50 },
  { id: 'exp-1-3', category: 'Repairs', description: 'Tire patch', amount: 75.00 },
];
const freight1Revenue = 3500 + 500 + 50 + 50 + 100;
const freight1TotalExpenses = freight1Expenses.reduce((acc, exp) => acc + exp.amount, 0);

const freight2Expenses: LoadExpense[] = [
    { id: 'exp-2-1', category: 'Fuel', description: 'Fuel for trip', amount: 420.50 },
    { id: 'exp-2-2', category: 'Other', description: 'Lumper fee', amount: 150.00 },
];
const freight2Revenue = 1800 + 200 + 25 + 25 + 50;
const freight2TotalExpenses = freight2Expenses.reduce((acc, exp) => acc + exp.amount, 0);

export const initialDrivers: Driver[] = [
    { id: 'drv-1', name: 'John Doe', payRate: 0.65, payType: 'per-mile' },
    { id: 'drv-2', name: 'Jane Smith', payRate: 25, payType: 'percentage' },
];

export const initialFreight: Freight[] = [
  { 
    id: 'frt-1', 
    freightId: '#3053', 
    origin: 'Dallas, TX', 
    destination: 'Miami, FL', 
    distance: 1350, 
    date: new Date('2024-05-01'), 
    weight: 30000,
    driverId: 'drv-1',
    driverName: 'John Doe',
    lineHaul: 3500, 
    fuelSurcharge: 500,
    loading: 50,
    unloading: 50,
    accessorials: 100, 
    expenses: freight1Expenses,
    revenue: freight1Revenue,
    totalExpenses: freight1TotalExpenses,
    netProfit: freight1Revenue - freight1TotalExpenses,
  },
  { 
    id: 'frt-2', 
    freightId: '#3054', 
    origin: 'Miami, FL', 
    destination: 'Atlanta, GA', 
    distance: 660, 
    date: new Date('2024-05-05'), 
    weight: 28000,
    driverId: 'drv-2',
    driverName: 'Jane Smith',
    lineHaul: 1800, 
    fuelSurcharge: 200, 
    loading: 25,
    unloading: 25,
    accessorials: 50,
    expenses: freight2Expenses,
    revenue: freight2Revenue,
    totalExpenses: freight2TotalExpenses,
    netProfit: freight2Revenue - freight2TotalExpenses,
  },
];

export const initialAssets: Asset[] = [
    { id: 'ast-1', type: 'Truck', identifier: 'Unit 101 - VNL 760', description: '2022 Volvo VNL 760' },
    { id: 'ast-2', type: 'Truck', identifier: 'Unit 102 - Cascadia', description: '2023 Freightliner Cascadia' },
    { id: 'ast-3', type: 'Business Car', identifier: 'Ford Explorer', description: '2021 Ford Explorer for office use' },
];
