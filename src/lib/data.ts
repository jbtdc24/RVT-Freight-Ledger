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

// Helper to get random item from array
const random = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate 200 freight items
export const initialFreight: Freight[] = Array.from({ length: 200 }).map((_, i) => {
  const origin = random(['Dallas, TX', 'Miami, FL', 'Atlanta, GA', 'Chicago, IL', 'Los Angeles, CA', 'New York, NY', 'Seattle, WA', 'Denver, CO']);
  const destination = random(['Phoenix, AZ', 'Houston, TX', 'Detroit, MI', 'Boston, MA', 'San Francisco, CA', 'Nashville, TN']);
  // Ensure origin != destination
  const realDest = destination === origin ? 'Las Vegas, NV' : destination;

  const dist = randomInt(400, 2500);
  const lineHaul = dist * (randomInt(180, 350) / 100);

  // Random date within last 120 days
  const date = new Date('2026-02-03');
  date.setDate(date.getDate() - randomInt(0, 120));

  const expenses: LoadExpense[] = [];
  if (Math.random() > 0.3) {
    expenses.push({ id: `exp-${i}-1`, category: 'Fuel', description: 'Fuel', amount: randomInt(300, 800) });
  }
  if (Math.random() > 0.7) {
    expenses.push({ id: `exp-${i}-2`, category: 'Repairs', description: 'Quick fix', amount: randomInt(50, 200) });
  }

  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
  const surcharges = randomInt(100, 500);
  const rev = lineHaul + surcharges;
  const driver = random(initialDrivers);
  const percent = 65;
  const ownerAmt = lineHaul * (percent / 100);

  return {
    id: `frt-${i}`,
    freightId: `#${3050 + i}`,
    origin,
    destination: realDest,
    distance: dist,
    date,
    weight: randomInt(15000, 42000),
    driverId: driver.id,
    driverName: driver.name,
    assetId: 'ast-1',
    assetName: 'Unit 101',
    lineHaul,
    fuelSurcharge: surcharges,
    loading: 0,
    unloading: 0,
    accessorials: 0,
    expenses,
    revenue: rev,
    totalExpenses: totalExp,
    ownerPercentage: percent,
    ownerAmount: ownerAmt,
    netProfit: (ownerAmt + surcharges) - totalExp,
  };
});

export const initialAssets: Asset[] = [
  { id: 'ast-1', type: 'Truck', identifier: 'Unit 101 - VNL 760', description: '2022 Volvo VNL 760' },
  { id: 'ast-2', type: 'Truck', identifier: 'Unit 102 - Cascadia', description: '2023 Freightliner Cascadia' },
  { id: 'ast-3', type: 'Business Car', identifier: 'Ford Explorer', description: '2021 Ford Explorer for office use' },
];
