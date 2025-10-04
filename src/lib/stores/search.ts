import { writable } from 'svelte/store';

export const searchQuery = writable<string>('');

export function setSearchQuery(query: string) {
    searchQuery.set(query);
}
