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

// Generate 50 freight items (49 valid, 1 invalid)
// MATH VERIFICATION RULES:
// 1. Revenue (Broker Pay) = Line Haul + Fuel Surcharge + Accessorials + Loading + Unloading
// 2. Owner Amount (Our Share) = (Line Haul * Owner %) + Fuel Surcharge + Accessorials + Loading + Unloading
// 3. Total Expenses = Sum of all individual expense items
// 4. Net Profit = Owner Amount - Total Expenses
export const initialFreight: Freight[] = [
  ...Array.from({ length: 49 }).map((_, i) => {
    const origin = random(['Dallas, TX', 'Miami, FL', 'Atlanta, GA', 'Chicago, IL', 'Los Angeles, CA', 'Seattle, WA', 'Denver, CO', 'New York, NY']);
    const destination = random(['Phoenix, AZ', 'Houston, TX', 'Detroit, MI', 'Portland, OR', 'San Francisco, CA', 'Nashville, TN', 'Charlotte, NC']);
    const dist = randomInt(400, 2500);

    // Random date in last 90 days
    const date = new Date();
    date.setDate(date.getDate() - randomInt(0, 90));

    // --- 1. Define Base Component Values ---
    const lineHaul = dist * (randomInt(180, 350) / 100);
    const fuelSurcharge = randomInt(100, 500);
    const accessorials = randomInt(0, 1) > 0.8 ? randomInt(50, 200) : 0;
    const loading = randomInt(0, 1) > 0.9 ? 50 : 0;
    const unloading = randomInt(0, 1) > 0.9 ? 50 : 0;
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
    const expenseAmount = randomInt(200, 800);
    const expenses: LoadExpense[] = [
      { id: `exp-${i}`, category: 'Fuel', description: 'Fuel', amount: expenseAmount }
    ];
    if (randomInt(0, 1) > 0.7) {
      const repairAmount = randomInt(50, 300);
      expenses.push({ id: `exp-${i}-rep`, category: 'Repairs', description: 'Misc Repair', amount: repairAmount });
    }
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

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
      date,
      weight: randomInt(15000, 42000),
      driverId: initialDrivers[i % initialDrivers.length].id,
      driverName: initialDrivers[i % initialDrivers.length].name,
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

      // Extended Details
      agencyName: "Rob Johnston - TPN",
      postingCode: "TPO",
      contactName: "Jenn Peterson",
      contactPhone: "(480) 466-9679",
      contactEmail: "tpodispatch@landstarmail.com",
      operatingEntity: "Landstar Ranger Inc",

      freightBillNumber: `${1419800 + i}`,
      customerReferenceNumber: `S0281${60 + i}`,

      trailerNumber: `${672600 + i}`,
      equipmentType: "VANL",
      hazardousMaterial: false,

      pickup: {
        companyName: "Christie Lites Las Vegas",
        address: "4325 Corporate Center Drive",
        cityStateZip: "North Las Vegas, NV 89030",
        contactName: "Dispatch",
        contactPhone: "555-0101",
        appointmentTime: "14:00 - 16:00",
        appointmentNumber: `APT-${100 + i}`,
        notes: "Driver must check in at guard shack."
      },
      drop: {
        companyName: "Seattle Convention Center",
        address: "1715 Boren Ave",
        cityStateZip: "Seattle, WA 98118",
        contactName: "Receiving",
        contactPhone: "555-0102",
        appointmentTime: "08:00 - 12:00",
        appointmentNumber: `DEL-${200 + i}`,
        notes: "Unload at dock 4."
      },

      commodity: "CONSUMER GOODS OR APPLIANCES",
      pieces: randomInt(10, 50),
      dimensions: "40x48x96",
      bcoSpecialInstructions: "Driver must call for dispatch instructions upon empty.",
      status: i < 5 ? 'In Route' : 'Delivered'
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
    status: 'Delivered'
  } as Freight
];

export const initialAssets: Asset[] = [
  { id: 'ast-1', type: 'Truck', identifier: 'Unit 101 - VNL 760', description: '2022 Volvo VNL 760' },
  { id: 'ast-2', type: 'Truck', identifier: 'Unit 102 - Cascadia', description: '2023 Freightliner Cascadia' },
  { id: 'ast-3', type: 'Business Car', identifier: 'Ford Explorer', description: '2021 Ford Explorer for office use' },
];

// Dummy Business Expenses (Standalone)
export const initialExpenses: any[] = [
  // Truck Expenses
  {
    id: 'exp-truck-1',
    category: 'Fuel',
    description: 'Deadhead Fuel to Las Vegas',
    amount: 350.50,
    date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    assetId: 'ast-1',
    assetName: 'Unit 101 - VNL 760',
    comments: [{ id: 'cmt-1', text: 'System generated.', author: 'System', timestamp: new Date().toISOString(), type: 'system' }]
  },
  {
    id: 'exp-truck-2',
    category: 'Maintenance',
    description: 'Oil Change',
    amount: 450.00,
    date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
    assetId: 'ast-2',
    assetName: 'Unit 102 - Cascadia',
    comments: [{ id: 'cmt-2', text: 'System generated.', author: 'System', timestamp: new Date().toISOString(), type: 'system' }]
  },
  {
    id: 'exp-truck-3',
    category: 'Repairs',
    description: 'Brake Pad Replacement',
    amount: 850.25,
    date: new Date(new Date().setDate(new Date().getDate() - 25)).toISOString(),
    assetId: 'ast-1',
    assetName: 'Unit 101 - VNL 760',
    comments: [{ id: 'cmt-3', text: 'System generated.', author: 'System', timestamp: new Date().toISOString(), type: 'system' }]
  },
  {
    id: 'exp-truck-4',
    category: 'Tolls',
    description: 'PrePass Monthly Fee',
    amount: 125.00,
    date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    assetId: 'ast-1',
    assetName: 'Unit 101 - VNL 760',
    comments: [{ id: 'cmt-4', text: 'System generated.', author: 'System', timestamp: new Date().toISOString(), type: 'system' }]
  },
  // Office Expenses
  {
    id: 'exp-office-1',
    category: 'Other',
    description: 'Office Rent - February',
    amount: 1200.00,
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    comments: [{ id: 'cmt-5', text: 'System generated.', author: 'System', timestamp: new Date().toISOString(), type: 'system' }]
  },
  {
    id: 'exp-office-2',
    category: 'Other',
    description: 'Software Subscriptions (DAT/Samsara)',
    amount: 299.00,
    date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    comments: [{ id: 'cmt-6', text: 'System generated.', author: 'System', timestamp: new Date().toISOString(), type: 'system' }]
  },
  {
    id: 'exp-office-3',
    category: 'Other',
    description: 'Internet & Phone',
    amount: 185.00,
    date: new Date(new Date().setDate(new Date().getDate() - 12)).toISOString(),
    comments: [{ id: 'cmt-7', text: 'System generated.', author: 'System', timestamp: new Date().toISOString(), type: 'system' }]
  },
  // Driver Expenses
  {
    id: 'exp-driver-1',
    category: 'Other',
    description: 'Safety Bonus',
    amount: 500.00,
    date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    driverId: 'drv-1',
    driverName: 'John Doe',
    comments: [{ id: 'cmt-8', text: 'System generated.', author: 'System', timestamp: new Date().toISOString(), type: 'system' }]
  },
  {
    id: 'exp-driver-2',
    category: 'Other',
    description: 'Hotel Reimbursement',
    amount: 145.00,
    date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
    driverId: 'drv-2',
    driverName: 'Jane Smith',
    comments: [{ id: 'cmt-9', text: 'System generated.', author: 'System', timestamp: new Date().toISOString(), type: 'system' }]
  },
  {
    id: 'exp-truck-5',
    category: 'Fuel',
    description: 'Fuel for Unit 101',
    amount: 520.00,
    date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    assetId: 'ast-1',
    assetName: 'Unit 101 - VNL 760',
    comments: [{ id: 'cmt-10', text: 'Regular fuel.', author: 'System', timestamp: new Date().toISOString(), type: 'system' }]
  },
  {
    id: 'exp-office-4',
    category: 'Other',
    description: 'Office Supplies (Paper, Pens)',
    amount: 45.30,
    date: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(),
    comments: [{ id: 'cmt-11', text: 'System generated.', author: 'System', timestamp: new Date().toISOString(), type: 'system' }]
  },
  {
    id: 'exp-truck-6',
    category: 'Maintenance',
    description: 'Wiper Blade Replacement',
    amount: 65.00,
    date: new Date(new Date().setDate(new Date().getDate() - 6)).toISOString(),
    assetId: 'ast-2',
    assetName: 'Unit 102 - Cascadia',
    comments: [{ id: 'cmt-12', text: 'System generated.', author: 'System', timestamp: new Date().toISOString(), type: 'system' }]
  },
  {
    id: 'exp-truck-7',
    category: 'Fuel',
    description: 'Fuel for Unit 102',
    amount: 480.00,
    date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
    assetId: 'ast-2',
    assetName: 'Unit 102 - Cascadia',
    comments: [{ id: 'cmt-13', text: 'Fuel.', author: 'System', timestamp: new Date().toISOString(), type: 'system' }]
  },
  {
    id: 'exp-driver-3',
    category: 'Other',
    description: 'DOT Medical Card Reimbursement',
    amount: 120.00,
    date: new Date(new Date().setDate(new Date().getDate() - 8)).toISOString(),
    driverId: 'drv-1',
    driverName: 'John Doe',
    comments: [{ id: 'cmt-14', text: 'System generated.', author: 'System', timestamp: new Date().toISOString(), type: 'system' }]
  },
  {
    id: 'exp-office-5',
    category: 'Other',
    description: 'Electric Bill',
    amount: 215.40,
    date: new Date(new Date().setDate(new Date().getDate() - 9)).toISOString(),
    comments: [{ id: 'cmt-15', text: 'Utility.', author: 'System', timestamp: new Date().toISOString(), type: 'system' }]
  },
  {
    id: 'exp-office-6',
    category: 'Other',
    description: 'Accounting Software Subscription',
    amount: 150.00,
    date: new Date(new Date().setDate(new Date().getDate() - 11)).toISOString(),
    comments: [{ id: 'cmt-16', text: 'Software.', author: 'System', timestamp: new Date().toISOString(), type: 'system' }]
  },
  {
    id: 'exp-truck-8',
    category: 'Scale Ticket',
    description: 'CAT Scale - Weighing',
    amount: 12.50,
    date: new Date(new Date().setDate(new Date().getDate() - 12)).toISOString(),
    assetId: 'ast-1',
    assetName: 'Unit 101 - VNL 760',
    comments: [{ id: 'cmt-17', text: 'Scale Fee.', author: 'System', timestamp: new Date().toISOString(), type: 'system' }]
  },
  {
    id: 'exp-truck-9',
    category: 'Repairs',
    description: 'Light Bulb (Tail Light)',
    amount: 25.00,
    date: new Date(new Date().setDate(new Date().getDate() - 13)).toISOString(),
    assetId: 'ast-1',
    assetName: 'Unit 101 - VNL 760',
    comments: [{ id: 'cmt-18', text: 'Repair.', author: 'System', timestamp: new Date().toISOString(), type: 'system' }]
  },
  {
    id: 'exp-office-7',
    category: 'Other',
    description: 'Insurance Premium - Q1',
    amount: 3500.00,
    date: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
    comments: [{ id: 'cmt-19', text: 'Insurance.', author: 'System', timestamp: new Date().toISOString(), type: 'system' }]
  }
];
