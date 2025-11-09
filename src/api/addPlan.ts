import { ShoppingItem } from '../types';

export type AddPlanItem = { productUrl: string; qty: number };
export type AddPlan = { retailer: 'woolworths' | 'coles'; items: AddPlanItem[] };

const DEFAULT_ENDPOINT = process.env.EXPO_PUBLIC_ADDPLAN_URL || 'http://localhost:4000/add-plan';

export async function fetchAddPlan(retailer: 'woolworths' | 'coles', items: ShoppingItem[]): Promise<AddPlan> {
	const res = await fetch(DEFAULT_ENDPOINT, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ retailer, items })
	});
	if (!res.ok) {
		let errorMessage = `AddPlan request failed: ${res.status}`;
		try {
			const errorData = await res.json();
			if (errorData?.error) {
				errorMessage = `AddPlan request failed: ${res.status} - ${errorData.error}`;
			}
		} catch {
			// If response isn't JSON, use the status text
			errorMessage = `AddPlan request failed: ${res.status} ${res.statusText || ''}`;
		}
		throw new Error(errorMessage);
	}
	return (await res.json()) as AddPlan;
}


