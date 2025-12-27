// Coles/Woolworths add-plan web scraping has been removed.
// This module is kept as a no-op shim to avoid breaking imports.
export type AddPlanItem = { productUrl: string; qty: number };
export type AddPlan = { retailer: string; items: AddPlanItem[] };

export async function fetchAddPlan(): Promise<AddPlan> {
  throw new Error('Retailer shopping plan API has been disabled.');
}

