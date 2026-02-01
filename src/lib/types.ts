export type LoadExpense = {
  id: string;
  category: 'Maintenance' | 'Fuel' | 'Repairs' | 'Other';
  description: string;
  amount: number;
};

export type Freight = {
  id: string;
  freightId: string;
  origin: string;
  destination:string;
  distance: number;
  date: Date;
  weight: number;
  driverId?: string;
  driverName?: string;
  
  // Revenue
  lineHaul: number;
  fuelSurcharge: number;
  loading: number;
  unloading: number;
  accessorials: number; // for other/misc charges

  // Expenses
  expenses: LoadExpense[];

  // Calculated values
  revenue: number;
  totalExpenses: number;
  netProfit: number;
};

export type Asset = {
  id: string;
  type: 'Truck' | 'Business Car';
  identifier: string;
  description: string;
};

export type Driver = {
    id: string;
    name: string;
    payRate: number; // can be $/mile or % of revenue
    payType: 'per-mile' | 'percentage';
};
