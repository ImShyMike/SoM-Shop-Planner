import { writable } from 'svelte/store';

export type CartState = Record<number, number>;

const STORAGE_KEY = 'cart';

function sanitizeCart(input: unknown): CartState {
	if (!input || typeof input !== 'object') return {};

	const entries = Object.entries(input as Record<number, unknown>).flatMap(([key, value]) => {
		const id = Number(key);
		const count = Number(value);

		if (!Number.isFinite(id) || !Number.isInteger(id) || !Number.isFinite(count)) {
			return [];
		}

		const safeCount = Math.max(0, Math.floor(count));
		if (safeCount === 0) {
			return [];
		}

		return [[id, safeCount] as const];
	});

	return Object.fromEntries(entries);
}

function loadCart(): CartState {
	if (typeof localStorage === 'undefined') {
		return {};
	}

	const stored = localStorage.getItem(STORAGE_KEY);
	if (!stored) {
		return {};
	}

	try {
		return sanitizeCart(JSON.parse(stored));
	} catch (error) {
		console.error('Failed to parse cart from localStorage', error);
		localStorage.removeItem(STORAGE_KEY);
		return {};
	}
}

export const cart = writable<CartState>(loadCart());

cart.subscribe((value) => {
	if (typeof localStorage === 'undefined') {
		return;
	}

	const sanitized = sanitizeCart(value);
	if (Object.keys(sanitized).length === 0) {
		localStorage.removeItem(STORAGE_KEY);
		return;
	}

	localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
});

export function setItemCount(itemId: number, count: number) {
	cart.update((current) => {
		const next: CartState = { ...current };
		const safeCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;

		if (safeCount === 0) {
			delete next[itemId];
			return next;
		}

		next[itemId] = safeCount;
		return next;
	});
}

export function incrementItemCount(itemId: number, delta = 1) {
	if (!Number.isFinite(delta) || delta === 0) {
		return;
	}

	cart.update((current) => {
		const next: CartState = { ...current };
		const currentValue = next[itemId] ?? 0;
		const newValue = Math.max(0, Math.floor(currentValue + delta));

		if (newValue === 0) {
			delete next[itemId];
			return next;
		}

		next[itemId] = newValue;
		return next;
	});
}

export function clearCart() {
	cart.set({});
}
