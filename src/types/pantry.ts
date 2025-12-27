export type PantryStatus = "good" | "warning" | "expired";

export interface PantryItem {
  id: string;
  name: string;
  quantity?: string;
  expiryDate: Date;
  createdAt: Date;
}


