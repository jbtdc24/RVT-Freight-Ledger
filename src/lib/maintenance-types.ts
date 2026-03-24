import type { Asset } from "./types";

export type MaintenanceType = 
  | "Oil Change" 
  | "Tire Replacement" 
  | "Brake Service" 
  | "Engine Repair" 
  | "Transmission" 
  | "Electrical" 
  | "Inspection" 
  | "Other";

export type MaintenanceStatus = "Scheduled" | "In Progress" | "Completed" | "Overdue";

export type MaintenanceRecord = {
  id: string;
  assetId: string;
  assetName: string;
  type: MaintenanceType;
  description: string;
  status: MaintenanceStatus;
  scheduledDate: string; // ISO date
  completedDate?: string; // ISO date
  mileage: number;
  cost: number;
  vendor?: string;
  notes?: string;
  attachments?: string[]; // URLs or base64
  reminders?: boolean;
  nextDueMileage?: number;
  nextDueDate?: string;
  createdAt: string;
  updatedAt: string;
};

export type MaintenanceReminder = {
  id: string;
  assetId: string;
  assetName: string;
  type: MaintenanceType;
  dueMileage?: number;
  dueDate?: string;
  status: "Upcoming" | "Due" | "Overdue";
  message: string;
};

export const maintenanceTypeOptions: MaintenanceType[] = [
  "Oil Change",
  "Tire Replacement", 
  "Brake Service",
  "Engine Repair",
  "Transmission",
  "Electrical",
  "Inspection",
  "Other"
];

export const initialMaintenanceRecords: MaintenanceRecord[] = [];
