<script lang="ts">
	import { onMount } from 'svelte';
	import { type ApiResponse, fetchData } from '$lib/api';
	import { selectedRegion, setRegion, REGION_OPTIONS } from '$lib/stores/region';
	import ShopCard from '$lib/components/ShopCard.svelte';

	let data: ApiResponse | undefined;
	let showBlackMarket = false;
	let showBadges = false;
	let filteredAndSorted: ApiResponse = [];
	let badges: number[] = [110, 108, 105, 109, 113, 115, 114, 107];

	onMount(async () => {
		data = await fetchData();
	});

	const normalizePrice = (price: number | null | undefined) =>
		typeof price === 'number' && Number.isFinite(price) ? price : Number.POSITIVE_INFINITY;

	$: {
		const region = $selectedRegion;
		const items = data ? [...data] : [];
		filteredAndSorted = items
			.filter((shop) => showBlackMarket || shop.shopType !== 'blackMarket')
			.filter((shop) => showBadges || !badges.includes(shop.id))
			.sort((a, b) => {
				const priceA = normalizePrice(a.prices[region]);
				const priceB = normalizePrice(b.prices[region]);

				if (priceA === priceB) {
					return a.title.localeCompare(b.title);
				}

				return priceA - priceB;
			});
	}
</script>

<main class="flex min-h-screen flex-col items-center bg-mantle p-4 text-text">
	<div class="mb-4 text-center">
		<h1 class="mb-2 text-4xl font-bold">SoM Shop Planner</h1>
		<p class="text-subtext0">Don't know what to buy? Worry no more!</p>
	</div>

	<div class="flex flex-row flex-wrap items-stretch justify-center gap-4">
		<div
			class="flex flex-col items-center self-stretch rounded border border-ctp-blue/70 bg-ctp-base p-4 text-text"
		>
			<h2 class="pb-2">Selected region: <span class="text-red">{$selectedRegion}</span></h2>
			<div class="flex flex-wrap gap-2 text-subtext0">
				{#each REGION_OPTIONS as r (r)}
					<button class="rounded bg-overlay0/20 p-2" onclick={() => setRegion(r)}>{r}</button>
				{/each}
			</div>
		</div>

		<div
			class="flex flex-col items-center self-stretch rounded border border-ctp-blue/70 bg-ctp-base p-4 text-text"
		>
			<h2 class="pb-2">Filter Options</h2>
			<div class="flex flex-col flex-wrap text-subtext0">
				<label for="blackMarketToggle" class="flex cursor-pointer items-center gap-2 text-subtext0">
					<input
						type="checkbox"
						id="blackMarketToggle"
						bind:checked={showBlackMarket}
						class="rounded bg-overlay0/80 accent-ctp-blue"
					/>
					Show Black Market Items
				</label>
				<label for="badgesToggle" class="flex cursor-pointer items-center gap-2 text-subtext0">
					<input
						type="checkbox"
						id="badgesToggle"
						bind:checked={showBadges}
						class="rounded bg-overlay0/80 accent-ctp-blue"
					/>
					Show Badges
				</label>
			</div>
		</div>
	</div>

	<div class="mt-2 w-full">
		{#if data}
			{#if filteredAndSorted.length}
				<div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
					{#each filteredAndSorted as shop (shop.id)}
						<ShopCard item={shop} />
					{/each}
				</div>
			{:else}
				<p class="mt-4 text-center text-subtext0">No shops match the selected filters.</p>
			{/if}
		{:else}
			<p class="mt-4 text-center">Loading...</p>
		{/if}
	</div>
</main>
