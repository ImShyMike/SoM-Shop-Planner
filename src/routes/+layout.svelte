<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>SoM Shop Planner</title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta
		name="description"
		content="Why would you need this? Ik ur gonna get 3 pairs of cat ears anyways :3"
	/>
</svelte:head>

<div class="flex min-h-screen flex-col">
	{@render children?.()}
</div>
