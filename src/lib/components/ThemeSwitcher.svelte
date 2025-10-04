<script lang="ts">
	import LucideMoon from '~icons/lucide/moon';
	import LucideSun from '~icons/lucide/sun';

	let currentTheme: 'light' | 'dark' = 'dark';

	function changeTheme() {
		if (currentTheme === 'dark') {
			document.documentElement.classList.remove('mocha');
			currentTheme = 'light';
			localStorage.setItem('theme', 'light');
		} else {
			document.documentElement.classList.add('mocha');
			currentTheme = 'dark';
			localStorage.setItem('theme', 'dark');
		}
	}
</script>

<svelte:component
	this={currentTheme === 'dark' ? LucideSun : LucideMoon}
	class="h-10 w-10 cursor-pointer text-text hover:text-subtext0"
	onclick={changeTheme}
/>
