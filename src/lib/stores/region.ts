import { writable } from 'svelte/store';
import type { Region } from '$lib/api';

const DEFAULT_REGION: Region = 'US';

function isValidRegion(r: string): r is Region {
	return ['US', 'EU', 'IN', 'CA', 'AU', 'XX'].includes(r);
}

export const selectedRegion = writable<Region>(DEFAULT_REGION);

export function setRegion(region: string) {
	if (!isValidRegion(region)) return;
	selectedRegion.set(region);
}

export const REGION_OPTIONS: Region[] = ['US', 'EU', 'IN', 'CA', 'AU', 'XX'];
