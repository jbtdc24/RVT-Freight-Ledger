import type { Freight, LoadExpense, Asset, Driver, LoadComment } from "./types";

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

// Helper to get random item from array
const random = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate 4 freight items (3 valid, 1 invalid)
// MATH VERIFICATION RULES:
// 1. Revenue (Broker Pay) = Line Haul + Fuel Surcharge + Accessorials + Loading + Unloading
// 2. Owner Amount (Our Share) = (Line Haul * Owner %) + Fuel Surcharge + Accessorials + Loading + Unloading
// 3. Total Expenses = Sum of all individual expense items
// 4. Net Profit = Owner Amount - Total Expenses
export const initialFreight: Freight[] = [
  ...Array.from({ length: 3 }).map((_, i) => {
    const origin = random(['Dallas, TX', 'Miami, FL', 'Atlanta, GA', 'Chicago, IL']);
    const destination = random(['Phoenix, AZ', 'Houston, TX', 'Detroit, MI']);
    const dist = randomInt(400, 2500);

    // --- 1. Define Base Component Values ---
    const lineHaul = dist * (randomInt(180, 350) / 100);
    const fuelSurcharge = randomInt(100, 500);
    const accessorials = 0;
    const loading = 0;
    const unloading = 0;
    const ownerPercentage = 65; // We keep 65% of Line Haul

    // --- 2. Calculate Revenue (What Broker Pays) ---
    // Revenue = LH + Fuel + Acc + Load + Unload
    const revenue = lineHaul + fuelSurcharge + accessorials + loading + unloading;

    // --- 3. Calculate Owner Amount (What We Get Before Expenses) ---
    // Owner Amount = (LH * 0.65) + Fuel + Acc + Load + Unload
    // Note: Surcharges are typically passed through 100% to the owner/truck
    const ownerBase = lineHaul * (ownerPercentage / 100);
    const ownerAmount = ownerBase + fuelSurcharge + accessorials + loading + unloading;

    // --- 4. Define and Calculate Expenses ---
    const expenseAmount = randomInt(200, 600);
    const expenses: LoadExpense[] = [
      { id: `exp-${i}`, category: 'Fuel', description: 'Fuel', amount: expenseAmount }
    ];
    const totalExpenses = expenseAmount;

    // --- 5. Calculate Net Profit ---
    // Net Profit = Owner Amount - Total Expenses
    const netProfit = ownerAmount - totalExpenses;

    // Valid Load
    return {
      id: `frt-valid-${i}`,
      freightId: `#${5000 + i}`,
      origin,
      destination,
      distance: dist,
      date: new Date(), // Today
      weight: randomInt(15000, 42000),
      driverId: initialDrivers[0].id,
      driverName: initialDrivers[0].name,
      assetId: 'ast-1',
      assetName: 'Unit 101',

      // Financials
      lineHaul,
      fuelSurcharge,
      loading,
      unloading,
      accessorials,
      ownerPercentage,
      ownerAmount,    // Calculated above
      revenue,        // Calculated above

      expenses,
      totalExpenses,  // Calculated above
      netProfit,      // Calculated above

      comments: [{ id: `com-${i}`, text: "System generated valid load.", author: "System", timestamp: new Date().toISOString(), type: 'system' }],
    } as Freight;
  }),

  // 1 Invalid Load (Missing Driver & Comments)
  {
    id: `frt-invalid-1`,
    freightId: `#9999`,
    origin: "INVALID CITY",
    destination: "NOWHERE",
    distance: 1000,
    date: new Date(),
    weight: 10000,
    driverId: undefined, // Missing
    driverName: undefined, // Missing
    assetId: 'ast-1',
    assetName: 'Unit 101',

    // Math Check for Invalid Load:
    // Line Haul: 5000
    // Owner Split (65%): 3250
    // Expenses: 0
    // Profit: 3250
    lineHaul: 5000,
    fuelSurcharge: 0,
    loading: 0,
    unloading: 0,
    accessorials: 0,
    ownerPercentage: 65,
    ownerAmount: 3250, // 5000 * 0.65

    expenses: [],
    comments: [], // Missing

    revenue: 5000,
    totalExpenses: 0,
    netProfit: 3250,
  } as Freight
];

export const initialAssets: Asset[] = [
  { id: 'ast-1', type: 'Truck', identifier: 'Unit 101 - VNL 760', description: '2022 Volvo VNL 760' },
  { id: 'ast-2', type: 'Truck', identifier: 'Unit 102 - Cascadia', description: '2023 Freightliner Cascadia' },
  { id: 'ast-3', type: 'Business Car', identifier: 'Ford Explorer', description: '2021 Ford Explorer for office use' },
];
