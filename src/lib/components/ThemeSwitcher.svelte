<script lang="ts">
	import { onMount } from 'svelte';
	import LucideMoon from '~icons/lucide/moon';
	import LucideSun from '~icons/lucide/sun';

	let currentTheme: 'light' | 'dark' = 'dark';

	function applyTheme(theme: 'light' | 'dark') {
		if (typeof document !== 'undefined') {
			document.documentElement.classList.toggle('mocha', theme === 'dark');
		}

		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('theme', theme);
		}
	}

	function setTheme(theme: 'light' | 'dark') {
		currentTheme = theme;
		applyTheme(theme);
	}

	function toggleTheme() {
		setTheme(currentTheme === 'dark' ? 'light' : 'dark');
	}

	onMount(() => {
		if (typeof localStorage === 'undefined') {
			applyTheme(currentTheme);
			return;
		}

		const stored = localStorage.getItem('theme');
		if (stored === 'light' || stored === 'dark') {
			setTheme(stored);
		} else {
			setTheme(currentTheme);
		}
	});
</script>

<button
	type="button"
	class="top-6 left-6 flex cursor-pointer items-center justify-center rounded-full bg-blue p-4 text-crust shadow transition hover:bg-ctp-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-mantle"
	aria-label={currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
	on:click={toggleTheme}
>
	<svelte:component this={currentTheme === 'dark' ? LucideSun : LucideMoon} class="h-16 w-16" />
</button>
