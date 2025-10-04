<script lang="ts">
	import { onMount } from 'svelte';
	import { type ApiResponse, fetchData } from '$lib/api';
	import { selectedRegion, setRegion, REGION_OPTIONS } from '$lib/stores/region';
	import { balance, setBalance } from '$lib/stores/balance';
	import ShopCard from '$lib/components/ShopCard.svelte';

	let data: ApiResponse | undefined;
	let showBlackMarket = false;
	let showBadges = false;
	let seachQuery = '';
	let balanceInput = 0;
	let filteredAndSorted: ApiResponse = [];
	let badges: number[] = [110, 108, 105, 109, 113, 115, 114, 107];

	$: balanceInput = $balance;

	function handleBalanceInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const value = Number(target.value);
		setBalance(Number.isFinite(value) ? value : 0);
	}

	onMount(async () => {
		setBalance(localStorage.getItem('balance') ? Number(localStorage.getItem('balance')) : 0);
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
			.filter((shop) =>
				seachQuery
					? shop.title.toLowerCase().includes(seachQuery.toLowerCase()) ||
					  shop.description.toLowerCase().includes(seachQuery.toLowerCase())
					: true
			)
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
					<button class="rounded bg-overlay0/20 p-2" on:click={() => setRegion(r)}>{r}</button>
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

	<div class="mt-4 flex w-full max-w-4xl flex-row items-center justify-center gap-4 mx-auto">
		<div class="flex w-full max-w-md flex-col gap-1 justify-center">
			<label for="searchInput" class="text-sm text-subtext0">Search items</label>
			<input
				id="searchInput"
				type="text"
				placeholder="Search for items..."
				bind:value={seachQuery}
				tabindex="0"
				class="w-full h-10 rounded border border-ctp-blue/70 bg-ctp-base p-2 text-text placeholder:text-subtext0 focus:border-ctp-blue focus:outline-none"
			/>
		</div>
		<div class="flex w-full max-w-[160px] flex-col gap-1 justify-center">
			<label for="balanceInput" class="text-sm text-subtext0">Current shell balance</label>
			<div class="relative">
				<span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtext0">S</span>
				<input
					id="balanceInput"
					type="number"
					placeholder="Enter amount"
					bind:value={balanceInput}
					on:input={handleBalanceInput}
					min="0"
					class="w-full h-10 rounded border border-ctp-blue/70 bg-ctp-base p-2 pl-8 text-text placeholder:text-subtext0 focus:border-ctp-blue focus:outline-none"
				/>
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
