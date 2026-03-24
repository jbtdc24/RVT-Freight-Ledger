export type IFTAQuarter = "Q1" | "Q2" | "Q3" | "Q4";

export type IFTAJurisdiction = {
  state: string; // e.g., "TX", "CA"
  stateName: string; // e.g., "Texas", "California"
  miles: number; // Total miles driven
  fuelGallons: number; // Fuel purchased
  taxPaid: number; // Tax already paid
};

export type IFTATrip = {
  id: string;
  date: string; // ISO date
  assetId: string;
  assetName: string;
  driverId?: string;
  driverName?: string;
  fromState: string;
  toState: string;
  miles: number;
  fuelGallons?: number;
  route?: string;
};

export type IFTAReport = {
  id: string;
  year: number;
  quarter: IFTAQuarter;
  trips: IFTATrip[];
  jurisdictions: IFTAJurisdiction[];
  totalMiles: number;
  totalFuel: number;
  avgMpg: number;
  status: "Draft" | "Filed" | "Paid";
  filedDate?: string;
  createdAt: string;
  updatedAt: string;
};

export const usStates = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" }
];
