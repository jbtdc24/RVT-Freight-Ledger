import type { Freight, LoadExpense, Asset, Driver, LoadComment } from "./types";

// Drivers
export const initialDrivers: Driver[] = [
  { id: 'drv-1', name: 'Mike Wilson', payRate: 0.65, payType: 'per-mile', idImages: [], comments: [] },
];

// Assets
export const initialAssets: Asset[] = [
  { id: 'ast-1', type: 'Truck', identifier: 'Unit 101', description: '2022 Volvo VNL 760', idImages: [], comments: [] },
];

// Freight Load #1
const freight1Expenses: LoadExpense[] = [
  { id: 'exp-1-1', category: 'Fuel', description: 'Fuel stop - Texas', amount: 450.00 },
  { id: 'exp-1-2', category: 'Tolls', description: 'Toll fees', amount: 85.00 },
];
const freight1LineHaul = 3200;
const freight1OwnerPercentage = 65;
const freight1FuelSurcharge = 320;
const freight1Accessorials = 0;
const freight1Loading = 50;
const freight1Unloading = 50;
const freight1OwnerBase = freight1LineHaul * (freight1OwnerPercentage / 100);
const freight1OwnerAmount = freight1OwnerBase + freight1FuelSurcharge + freight1Accessorials + freight1Loading + freight1Unloading;
const freight1Revenue = freight1LineHaul + freight1FuelSurcharge + freight1Accessorials + freight1Loading + freight1Unloading;
const freight1TotalExpenses = freight1Expenses.reduce((acc, exp) => acc + exp.amount, 0);
const freight1NetProfit = freight1OwnerAmount - freight1TotalExpenses;

// Freight Load #2
const freight2Expenses: LoadExpense[] = [
  { id: 'exp-2-1', category: 'Fuel', description: 'Fuel - California', amount: 380.00 },
  { id: 'exp-2-2', category: 'Repairs', description: 'Flat tire repair', amount: 125.00 },
  { id: 'exp-2-3', category: 'Other', description: 'Lumper fee', amount: 75.00 },
];
const freight2LineHaul = 2800;
const freight2OwnerPercentage = 65;
const freight2FuelSurcharge = 280;
const freight2Accessorials = 100;
const freight2Loading = 0;
const freight2Unloading = 50;
const freight2OwnerBase = freight2LineHaul * (freight2OwnerPercentage / 100);
const freight2OwnerAmount = freight2OwnerBase + freight2FuelSurcharge + freight2Accessorials + freight2Loading + freight2Unloading;
const freight2Revenue = freight2LineHaul + freight2FuelSurcharge + freight2Accessorials + freight2Loading + freight2Unloading;
const freight2TotalExpenses = freight2Expenses.reduce((acc, exp) => acc + exp.amount, 0);
const freight2NetProfit = freight2OwnerAmount - freight2TotalExpenses;

export const initialFreight: Freight[] = [
  {
    id: 'frt-1',
    freightId: '#1001',
    origin: 'Dallas, TX',
    destination: 'Los Angeles, CA',
    distance: 1450,
    date: new Date(),
    weight: 38000,
    driverId: 'drv-1',
    driverName: 'Mike Wilson',
    assetId: 'ast-1',
    assetName: 'Unit 101',

    lineHaul: freight1LineHaul,
    fuelSurcharge: freight1FuelSurcharge,
    loading: freight1Loading,
    unloading: freight1Unloading,
    accessorials: freight1Accessorials,
    ownerPercentage: freight1OwnerPercentage,
    ownerAmount: freight1OwnerAmount,
    revenue: freight1Revenue,

    expenses: freight1Expenses,
    totalExpenses: freight1TotalExpenses,
    netProfit: freight1NetProfit,

    comments: [{ id: 'com-1', text: 'Load created.', author: 'System', timestamp: new Date().toISOString(), type: 'system' }],

    agencyName: 'ABC Logistics',
    contactName: 'Sarah Johnson',
    contactPhone: '(555) 123-4567',
    contactEmail: 'sarah@abclogistics.com',
    freightBillNumber: 'FB-2024-001',
    customerReferenceNumber: 'REF-001',
    trailerNumber: 'TRL-5500',
    equipmentType: 'Dry Van',
    hazardousMaterial: false,
    commodity: 'Electronics',
    pieces: 24,
    status: 'Delivered'
  },
  {
    id: 'frt-2',
    freightId: '#1002',
    origin: 'Phoenix, AZ',
    destination: 'Seattle, WA',
    distance: 1420,
    date: new Date(new Date().setDate(new Date().getDate() - 3)),
    weight: 42000,
    driverId: 'drv-1',
    driverName: 'Mike Wilson',
    assetId: 'ast-1',
    assetName: 'Unit 101',

    lineHaul: freight2LineHaul,
    fuelSurcharge: freight2FuelSurcharge,
    loading: freight2Loading,
    unloading: freight2Unloading,
    accessorials: freight2Accessorials,
    ownerPercentage: freight2OwnerPercentage,
    ownerAmount: freight2OwnerAmount,
    revenue: freight2Revenue,

    expenses: freight2Expenses,
    totalExpenses: freight2TotalExpenses,
    netProfit: freight2NetProfit,

    comments: [{ id: 'com-2', text: 'Load created.', author: 'System', timestamp: new Date().toISOString(), type: 'system' }],

    agencyName: 'XYZ Transport',
    contactName: 'John Miller',
    contactPhone: '(555) 987-6543',
    contactEmail: 'john@xyztransport.com',
    freightBillNumber: 'FB-2024-002',
    customerReferenceNumber: 'REF-002',
    trailerNumber: 'TRL-5501',
    equipmentType: 'Dry Van',
    hazardousMaterial: false,
    commodity: 'Furniture',
    pieces: 18,
    status: 'In Route'
  }
];

// Business Expenses (Standalone overhead expenses)
export const initialExpenses: any[] = [
  {
    id: 'biz-exp-1',
    category: 'Fuel',
    description: 'Deadhead fuel - empty miles',
    amount: 250.00,
    date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    assetId: 'ast-1',
    assetName: 'Unit 101',
    comments: []
  },
  {
    id: 'biz-exp-2',
    category: 'Maintenance',
    description: 'Oil change',
    amount: 450.00,
    date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    assetId: 'ast-1',
    assetName: 'Unit 101',
    comments: []
  },
  {
    id: 'biz-exp-3',
    category: 'Other',
    description: 'Office rent - February',
    amount: 1200.00,
    date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    comments: []
  },
];
