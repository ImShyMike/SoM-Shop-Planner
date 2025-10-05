import { type ApiResponse, type ShopItem } from '$lib/api';
import type { CartState } from '$lib/stores/cart';
import type { Region } from '$lib/api';

export type FinanceSummary = {
	totalItems: number;
	totalCost: number;
	balance: number;
	remainingBalance: number;
	overBudget: boolean;
};

export type CartLine = {
	item: ShopItem;
	count: number;
	unitPrice: number;
	total: number;
};

export function buildCartBreakdown(
	items: ApiResponse,
	cartState: CartState,
	region: Region
): CartLine[] {
	const breakdown: CartLine[] = [];

	for (const item of items) {
		const count = cartState[item.id] ?? 0;
		if (!count) continue;

		const price = item.prices[region];
		if (!Number.isFinite(price)) continue;

		const total = price * count;
		breakdown.push({
			item,
			count,
			unitPrice: price,
			total
		});
	}

	return breakdown.sort((a, b) => a.item.title.localeCompare(b.item.title));
}

export function summarizeFinance(
	breakdown: CartLine[],
	balanceInput: number | null | undefined
): FinanceSummary {
	const { totalItems, totalCost } = breakdown.reduce(
		(acc, line) => ({
			totalItems: acc.totalItems + line.count,
			totalCost: acc.totalCost + line.total
		}),
		{ totalItems: 0, totalCost: 0 }
	);
	const balance = Number.isFinite(balanceInput) ? (balanceInput as number) : 0;
	const remainingBalance = balance - totalCost;

	return {
		totalItems,
		totalCost,
		balance,
		remainingBalance,
		overBudget: balance > 0 ? totalCost > balance : false
	};
}
