import { writable } from 'svelte/store';
import type { Region } from '../api';

export type Config = {
	showBadges: boolean;
	showBlackMarket: boolean;
	searchQuery: string;
	region: Region;
	balance: number;
};

const DEFAULT_CONFIG: Config = {
	showBadges: true,
	showBlackMarket: false,
	searchQuery: '',
	region: 'US',
	balance: 0
};

function loadConfig(): Config {
	if (typeof localStorage === 'undefined') {
		return DEFAULT_CONFIG;
	}

	const stored = localStorage.getItem('config');
	if (stored) {
		try {
			return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
		} catch (e) {
			console.error('Failed to parse config from localStorage:', e);
			localStorage.removeItem('config');
		}
	}

	return DEFAULT_CONFIG;
}

export const config = writable<Config>(loadConfig());

config.subscribe((value) => {
	if (typeof localStorage === 'undefined') {
		return;
	}
	localStorage.setItem('config', JSON.stringify(value));
});

export function updateConfig(updates: Partial<Config>) {
	config.update((current) => ({ ...current, ...updates }));
}
