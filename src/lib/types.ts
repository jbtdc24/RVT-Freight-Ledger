export type ExpenseCategory = string;

export type LoadExpense = {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date?: string; // ISO string
  loadId?: string; // Back-reference
};

export type StandaloneExpense = {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string; // ISO string

  // Optional links
  driverId?: string;
  driverName?: string;
  assetId?: string;
  assetName?: string;

  // History
  comments?: LoadComment[];
};

export type LoadComment = {
  id: string;
  text: string;
  author: string; // e.g., "System", "John Doe"
  timestamp: string; // ISO string
  type: 'manual' | 'system';
};

export type Freight = {
  // Header Info
  agencyName?: string;
  postingCode?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactFax?: string;
  operatingEntity?: string;

  // Identifiers
  freightBillNumber?: string;
  customerReferenceNumber?: string;

  // Equipment
  trailerNumber?: string;
  equipmentType?: string;
  hazardousMaterial?: boolean;

  // Route Details
  pickup?: StopDetail;
  drop?: StopDetail;

  // Cargo
  commodity?: string;
  pieces?: number;
  dimensions?: string;
  nmfcCode?: string;
  freightClass?: string;
  temperatureControl?: string; // e.g. "Temp", "Reefer Settings"

  // Instructions
  bcoSpecialInstructions?: string;

  id: string;
  freightId: string; // Load #
  origin: string; // Kept for summary/table view
  destination: string; // Kept for summary/table view
  distance: number;
  date: Date;
  weight: number;
  driverId?: string;
  driverName?: string;
  assetId?: string;
  assetName?: string;

  // Revenue
  lineHaul: number;
  fuelSurcharge: number;
  loading: number;
  unloading: number;
  accessorials: number; // for other/misc charges

  // Expenses
  expenses: LoadExpense[];

  // Activity Log / Comments
  comments?: LoadComment[];
  signature?: string; // base64 or URL

  // Calculated values
  revenue: number;
  totalExpenses: number;
  netProfit: number;
  ownerPercentage: number;
  ownerAmount: number;

  // Status
  status: 'Draft' | 'For Pickup' | 'In Route' | 'Delivered' | 'Cancelled';
};

export type StopDetail = {
  companyName: string;
  address: string;
  cityStateZip: string;
  contactName?: string;
  contactPhone?: string;
  appointmentTime?: string;
  appointmentNumber?: string;
  notes?: string;
};

export type Asset = {
  id: string;
  type: 'Truck' | 'Business Car';
  identifier: string;
  description?: string;
};

export type Driver = {
  id: string;
  name: string;
  payRate: number; // can be $/mile or % of revenue
  payType: 'per-mile' | 'percentage';
};
