import { writable } from 'svelte/store';

export const balance = writable<number>(0);

export function setBalance(newBalance: number) {
    if (newBalance < 0) return;
    localStorage.setItem('balance', newBalance.toString());
    balance.set(newBalance);
}

export function adjustBalance(amount: number) {
    balance.update(b => {
        const newBalance = b + amount;
        return newBalance < 0 ? 0 : newBalance;
    });
}
