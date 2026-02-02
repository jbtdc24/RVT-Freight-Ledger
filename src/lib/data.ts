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

// Generate 5 freight items (4 valid, 1 invalid)
// MATH VERIFICATION:
// Broker Revenue = LineHaul + Fuel + Accessorials
// Owner Pay = (LineHaul * Split%) + Fuel + Accessorials
// Net Profit = Owner Pay - Expenses
export const initialFreight: Freight[] = [
  ...Array.from({ length: 4 }).map((_, i) => {
    const origin = random(['Dallas, TX', 'Miami, FL', 'Atlanta, GA', 'Chicago, IL']);
    const destination = random(['Phoenix, AZ', 'Houston, TX', 'Detroit, MI']);
    const dist = randomInt(400, 2500);

    // 1. Establish Base Numbers
    const lineHaul = dist * (randomInt(180, 350) / 100);
    const fuelSurcharge = randomInt(100, 500);
    const accessorials = 0; // Keeping simple for simulation
    const loading = 0;
    const unloading = 0;

    // 2. Establish Expenses
    const totalExp = randomInt(200, 600);

    // 3. Establish Split
    const ownerPercentage = 65; // 65% split

    // 4. Calculate Derived Values
    const brokerRevenue = lineHaul + fuelSurcharge + accessorials + loading + unloading;
    const ownerBase = lineHaul * (ownerPercentage / 100);
    const ownerGross = ownerBase + fuelSurcharge + accessorials + loading + unloading;
    const netProfit = ownerGross - totalExp;

    // Valid Load
    return {
      id: `frt-valid-${i}`,
      freightId: `#${4000 + i}`,
      origin,
      destination,
      distance: dist,
      date: new Date(), // Today
      weight: randomInt(15000, 42000),
      driverId: initialDrivers[0].id,
      driverName: initialDrivers[0].name,
      assetId: 'ast-1',
      assetName: 'Unit 101',

      // Breakdown
      lineHaul,
      fuelSurcharge,
      loading,
      unloading,
      accessorials,
      ownerPercentage,
      ownerAmount: ownerBase,

      expenses: [{ id: `exp-${i}`, category: 'Fuel', description: 'Fuel', amount: totalExp }],
      comments: [{ id: `com-${i}`, text: "System generated valid load.", author: "System", timestamp: new Date().toISOString(), type: 'system' }],

      // Totals
      revenue: brokerRevenue,       // What the broker pays (Total)
      totalExpenses: totalExp,      // What we spent
      netProfit: netProfit,         // What we kept
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

    // Math Check:
    // LH: 5000
    // Split: 65% -> 3250
    // Exp: 0
    // Profit: 3250
    lineHaul: 5000,
    fuelSurcharge: 0,
    loading: 0,
    unloading: 0,
    accessorials: 0,
    ownerPercentage: 65,
    ownerAmount: 3250,

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
