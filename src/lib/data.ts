import type { Freight, LoadExpense, Asset, Driver } from "./types";

const freight1Expenses: LoadExpense[] = [
  { id: 'exp-1-1', category: 'Fuel', description: 'Fuel stop 1', amount: 450.25 },
  { id: 'exp-1-2', category: 'Fuel', description: 'Fuel stop 2', amount: 400.50 },
  { id: 'exp-1-3', category: 'Repairs', description: 'Tire patch', amount: 75.00 },
];
const freight1LineHaul = 3500;
const freight1OwnerPercentage = 65;
const freight1OwnerAmount = freight1LineHaul * (freight1OwnerPercentage / 100);
const freight1Surcharges = 500 + 50 + 50 + 100;
const freight1Revenue = freight1LineHaul + freight1Surcharges;
const freight1TotalExpenses = freight1Expenses.reduce((acc, exp) => acc + exp.amount, 0);
const freight1NetProfit = (freight1OwnerAmount + freight1Surcharges) - freight1TotalExpenses;

const freight2Expenses: LoadExpense[] = [
  { id: 'exp-2-1', category: 'Fuel', description: 'Fuel for trip', amount: 420.50 },
  { id: 'exp-2-2', category: 'Other', description: 'Lumper fee', amount: 150.00 },
];
const freight2LineHaul = 1800;
const freight2OwnerPercentage = 65;
const freight2OwnerAmount = freight2LineHaul * (freight2OwnerPercentage / 100);
const freight2Surcharges = 200 + 25 + 25 + 50;
const freight2Revenue = freight2LineHaul + freight2Surcharges;
const freight2TotalExpenses = freight2Expenses.reduce((acc, exp) => acc + exp.amount, 0);
const freight2NetProfit = (freight2OwnerAmount + freight2Surcharges) - freight2TotalExpenses;

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
    date: new Date('2026-02-01'),
    weight: 30000,
    driverId: 'drv-1',
    driverName: 'John Doe',
    assetId: 'ast-1',
    assetName: 'Unit 101 - VNL 760',
    lineHaul: freight1LineHaul,
    fuelSurcharge: 500,
    loading: 50,
    unloading: 50,
    accessorials: 100,
    expenses: freight1Expenses,
    revenue: freight1Revenue,
    totalExpenses: freight1TotalExpenses,
    ownerPercentage: freight1OwnerPercentage,
    ownerAmount: freight1OwnerAmount,
    netProfit: freight1NetProfit,
  },
  {
    id: 'frt-2',
    freightId: '#3054',
    origin: 'Miami, FL',
    destination: 'Atlanta, GA',
    distance: 660,
    date: new Date('2026-02-03'),
    weight: 28000,
    driverId: 'drv-2',
    driverName: 'Jane Smith',
    assetId: 'ast-2',
    assetName: 'Unit 102 - Cascadia',
    lineHaul: freight2LineHaul,
    fuelSurcharge: 200,
    loading: 25,
    unloading: 25,
    accessorials: 50,
    expenses: freight2Expenses,
    revenue: freight2Revenue,
    totalExpenses: freight2TotalExpenses,
    ownerPercentage: freight2OwnerPercentage,
    ownerAmount: freight2OwnerAmount,
    netProfit: freight2NetProfit,
  },
];

export const initialAssets: Asset[] = [
  { id: 'ast-1', type: 'Truck', identifier: 'Unit 101 - VNL 760', description: '2022 Volvo VNL 760' },
  { id: 'ast-2', type: 'Truck', identifier: 'Unit 102 - Cascadia', description: '2023 Freightliner Cascadia' },
  { id: 'ast-3', type: 'Business Car', identifier: 'Ford Explorer', description: '2021 Ford Explorer for office use' },
];
