<script lang="ts">
	import { onMount } from 'svelte';
	import { type ApiResponse, type ShopItem, fetchData } from '$lib/api';
	import { config, updateConfig } from '$lib/stores/config';
	import type { Config } from '$lib/stores/config';
	import ShopCard from '$lib/components/ShopCard.svelte';
	import { REGIONS } from '$lib/api';
	import { cart, clearCart } from '$lib/stores/cart';
	import type { CartState } from '$lib/stores/cart';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
	import LucideShoppingCart from '~icons/lucide/shopping-cart';

	type FinanceSummary = {
		totalItems: number;
		totalCost: number;
		balance: number;
		remainingBalance: number;
		overBudget: boolean;
	};

	type CartLine = {
		item: ShopItem;
		count: number;
		unitPrice: number;
		total: number;
	};

	let data = $state<ApiResponse | undefined>(undefined);
	let filteredAndSorted = $state<ApiResponse>([]);
	let cartBreakdown = $state<CartLine[]>([]);
	let financeSummary = $state<FinanceSummary>({
		totalItems: 0,
		totalCost: 0,
		balance: 0,
		remainingBalance: 0,
		overBudget: false
	});
	let showCart = $state(false);
	const badges: number[] = [110, 108, 105, 109, 113, 115, 114, 107];
	const SHELL_ICON = 'https://summer.hackclub.com/shell.avif';

	const formatNumber = (value: number) =>
		Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 0 });

	const normalizePrice = (price: number | null | undefined) =>
		typeof price === 'number' && Number.isFinite(price) ? price : Number.POSITIVE_INFINITY;

	function handleBalanceInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const value = Number(target.value);

		updateConfig({ balance: Number.isFinite(value) ? value : 0 });
	}

	function handleSearchInput(event: Event) {
		const target = event.target as HTMLInputElement;
		updateConfig({ searchQuery: target.value });
	}

	onMount(async () => {
		data = await fetchData();
	});

	function filterAndSortItems(items: ApiResponse, currentConfig: Config): ApiResponse {
		return items
			.filter((shop) => currentConfig.showBlackMarket || shop.shopType !== 'blackMarket')
			.filter((shop) => currentConfig.showBadges || !badges.includes(shop.id))
			.filter((shop) => {
				if (!currentConfig.searchQuery) return true;

				const query = currentConfig.searchQuery.toLowerCase();
				return (
					shop.title.toLowerCase().includes(query) ||
					shop.description.toLowerCase().includes(query)
				);
			})
			.sort((a, b) => {
				const priceA = normalizePrice(a.prices[currentConfig.region]);
				const priceB = normalizePrice(b.prices[currentConfig.region]);

				if (priceA === priceB) {
					return a.title.localeCompare(b.title);
				}

				return priceA - priceB;
			});
	}

	function buildCartBreakdown(
		items: ApiResponse,
		cartState: CartState,
		region: Config['region']
	): CartLine[] {
		const breakdown: CartLine[] = [];

		for (const item of items) {
			const count = cartState[item.id] ?? 0;
			if (!count) continue;

			const price = item.prices[region];
			if (!Number.isFinite(price)) continue;

			const total = price * count;
			breakdown.push({
				item,
				count,
				unitPrice: price,
				total
			});
		}

		return breakdown.sort((a, b) => a.item.title.localeCompare(b.item.title));
	}

	function summarizeFinance(breakdown: CartLine[], balanceInput: number | null | undefined): FinanceSummary {
		let totalItems = 0;
		let totalCost = 0;

		for (const line of breakdown) {
			totalItems += line.count;
			totalCost += line.total;
		}

		const balance = Number.isFinite(balanceInput) ? (balanceInput as number) : 0;
		const remainingBalance = balance - totalCost;

		return {
			totalItems,
			totalCost,
			balance,
			remainingBalance,
			overBudget: balance > 0 ? totalCost > balance : false
		};
	}

	let previousCartItemCount = 0;

		$effect(() => {
			const currentConfig = $config;
			const items = data ? [...data] : [];
			const cartState = $cart;

			filteredAndSorted = filterAndSortItems(items, currentConfig);

			const breakdown = buildCartBreakdown(items, cartState, currentConfig.region);
			cartBreakdown = breakdown;

			const summary = summarizeFinance(breakdown, currentConfig.balance);
			financeSummary = summary;

			previousCartItemCount = summary.totalItems;
		});
</script>

<main class="relative flex min-h-screen w-full flex-col items-center bg-mantle p-2 sm:p-4 md:p-8 text-text">
	<div
		class={`flex w-full flex-col items-center gap-6 transition duration-200 ${
			showCart ? 'pointer-events-none blur-sm md:blur' : ''
		}`}
	>
		<header class="text-center mt-4">
			<h1 class="mb-2 text-4xl font-bold">SoM Shop Planner</h1>
			<p class="text-subtext0">Don't know what to buy? Worry no more!</p>
		</header>

		<section class="w-full">
			<div class="flex flex-wrap items-stretch justify-center gap-4">
				<section class="flex w-full max-w-xs flex-col items-center gap-3 rounded border border-ctp-blue/70 bg-ctp-base p-4 text-text sm:max-w-sm">
					<h2 class="text-lg font-semibold">Shop Region</h2>
					<div class="grid w-full grid-cols-2 gap-2 text-subtext1 sm:grid-cols-3">
						{#each REGIONS as r (r)}
							<button
								type="button"
								class={`cursor-pointer rounded px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-ctp-base ${
									$config.region === r ? 'bg-blue text-crust' : 'bg-overlay0/20 hover:bg-overlay0/40'
								}`}
								aria-pressed={$config.region === r}
								onclick={() => updateConfig({ region: r })}
							>
								{r}
							</button>
						{/each}
					</div>
				</section>

				<section class="flex w-full max-w-xs flex-col gap-3 rounded border border-ctp-blue/70 bg-ctp-base p-4 text-text sm:max-w-sm">
					<h2 class="text-lg font-semibold">Filter Options</h2>
					<div class="flex flex-col gap-1 text-subtext0">
						<label for="blackMarketToggle" class="flex cursor-pointer items-center gap-2 text-subtext0">
							<input
								type="checkbox"
								id="blackMarketToggle"
								checked={$config.showBlackMarket}
								class="h-4 w-4 rounded bg-overlay0/80 accent-ctp-blue"
								onchange={(event) =>
									updateConfig({ showBlackMarket: (event.currentTarget as HTMLInputElement).checked })}
							/>
							Show Black Market Items
						</label>
						<label for="badgesToggle" class="flex cursor-pointer items-center gap-2 text-subtext0">
							<input
								type="checkbox"
								id="badgesToggle"
								checked={$config.showBadges}
								class="h-4 w-4 rounded bg-overlay0/80 accent-ctp-blue"
								onchange={(event) =>
									updateConfig({ showBadges: (event.currentTarget as HTMLInputElement).checked })}
							/>
							Show Badges
						</label>
					</div>
				</section>
			</div>
		</section>

		<section class="w-full">
			<div class="mx-auto flex w-full max-w-4xl flex-col items-stretch gap-4 sm:flex-row sm:items-end">
				<div class="flex w-full flex-col gap-1">
					<label for="searchInput" class="text-sm text-subtext0">Search items</label>
					<input
						id="searchInput"
						type="text"
						placeholder="Search for items..."
						value={$config.searchQuery}
						oninput={handleSearchInput}
						tabindex="0"
						class="h-10 w-full rounded border border-ctp-blue/70 bg-ctp-base p-2 text-text placeholder:text-subtext0 focus:border-ctp-blue focus:outline-none focus:ring-1 focus:ring-ctp-blue"
					/>
				</div>
				<div class="flex w-full flex-col gap-1 sm:w-40">
					<label for="balanceInput" class="text-sm text-subtext0">Shell balance</label>
					<div class="relative">
						<span class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-subtext0">
							S
						</span>
						<input
							id="balanceInput"
							type="number"
							placeholder="Enter amount"
							value={$config.balance ?? ''}
							oninput={handleBalanceInput}
							min="0"
							class="h-10 w-full rounded border border-ctp-blue/70 bg-ctp-base p-2 pl-8 text-text placeholder:text-subtext0 focus:border-ctp-blue focus:outline-none focus:ring-1 focus:ring-ctp-blue"
						/>
					</div>
				</div>
			</div>
		</section>

		<section class="mt-2 w-full">
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
		</section>
	</div>

	{#if showCart}
		<div class="fixed inset-0 z-20 flex items-start justify-center px-4 py-6 mt-6">
			<div
				class="absolute inset-0 bg-mantle/60 backdrop-blur-sm"
				aria-hidden="true"
				onclick={() => (showCart = false)}
			></div>
			<div
				id="cart-panel"
				role="dialog"
				aria-modal="true"
				aria-labelledby="cart-panel-title"
				class="relative z-10 w-full max-w-4xl rounded border border-ctp-blue/70 bg-ctp-base p-4 text-text shadow-lg"
			>
				<header class="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
					<div>
						<h2 id="cart-panel-title" class="text-lg font-semibold text-text">Shopping summary</h2>
						<p class="text-sm text-subtext0">
							Be financially responsible! (or just get 3 pairs of thigh highs :3)
						</p>
					</div>
					<div class="flex items-center gap-2">
						<button
							type="button"
							class="rounded cursor-pointer border border-transparent bg-overlay0/40 px-3 py-2 text-sm font-medium text-subtext1 transition hover:bg-overlay0/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-ctp-base disabled:cursor-not-allowed disabled:opacity-60"
							onclick={clearCart}
							disabled={!cartBreakdown.length}
						>
							Clear selection
						</button>
						<button
							type="button"
							class="rounded cursor-pointer border border-transparent bg-blue px-3 py-2 text-sm font-semibold text-crust transition hover:bg-ctp-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-ctp-base"
							onclick={() => (showCart = false)}
						>
							Close cart
						</button>
					</div>
				</header>

				<div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
					<div class="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
						<div class="rounded bg-mantle/40 p-3">
							<p class="text-xs font-semibold tracking-wide text-subtext0 uppercase">Selected items</p>
							<p class="text-2xl font-semibold text-text">{financeSummary.totalItems}</p>
						</div>
						<div class="rounded bg-mantle/40 p-3">
							<p class="text-xs font-semibold tracking-wide text-subtext0 uppercase">Shells needed</p>
							<div class="flex items-center gap-1 text-2xl font-semibold text-text">
								<img height="18" width="18" src={SHELL_ICON} alt="shell icon" class="inline-block" />
								<span>{formatNumber(financeSummary.totalCost)}</span>
							</div>
						</div>
						<div class="rounded bg-mantle/40 p-3">
							<p class="text-xs font-semibold tracking-wide text-subtext0 uppercase">Current balance</p>
							<div class="flex items-center gap-1 text-2xl font-semibold text-text">
								{#if financeSummary.balance > 0}
									<img height="18" width="18" src={SHELL_ICON} alt="shell icon" class="inline-block" />
									<span>{formatNumber(financeSummary.balance)}</span>
								{:else}
									<span class="text-subtext0">--</span>
								{/if}
							</div>
						</div>
						<div class="rounded bg-mantle/40 p-3">
							<p class="text-xs font-semibold tracking-wide text-subtext0 uppercase">Remaining shells</p>
							{#if financeSummary.balance > 0}
								<div
									class={`flex items-center gap-1 text-2xl font-semibold ${
										financeSummary.remainingBalance < 0 ? 'text-red' : 'text-green'
									}`}
								>
									<img height="18" width="18" src={SHELL_ICON} alt="shell icon" class="inline-block" />
									<span>
										{financeSummary.remainingBalance < 0 ? '-' : ''}{formatNumber(
											Math.abs(financeSummary.remainingBalance)
										)}
									</span>
								</div>
							{:else}
								<span class="text-2xl font-semibold text-subtext0">--</span>
							{/if}
						</div>
					</div>
					<div class="flex w-full max-w-xs flex-col gap-2 md:w-auto">
						{#if financeSummary.balance > 0}
							{#if financeSummary.overBudget}
								<p class="text-sm text-red">
									You're {formatNumber(Math.abs(financeSummary.remainingBalance))} shells over your balance.
								</p>
							{:else}
								<p class="text-sm text-green/80">
									You'll have {formatNumber(financeSummary.remainingBalance)} shells left after this.
								</p>
							{/if}
						{:else}
							<p class="text-sm text-subtext0">
								Set your balance to track how many shells you'll have left.
							</p>
						{/if}
					</div>
				</div>

				<div class="w-max-full">
					<div class="mt-4 h-4 w-full rounded bg-overlay0/20">
						<div
							class="h-4 rounded bg-green transition-all duration-500 ease-out"
							style="width: {financeSummary.balance > 0 ? Math.min((financeSummary.totalCost / financeSummary.balance) * 100, 100) : 0}%"
						></div>
					</div>
				</div>

				<div class="mt-4 overflow-x-auto">
					<table class="min-w-full divide-y divide-overlay0/40 text-left text-sm text-subtext0">
						<thead>
							<tr class="text-xs tracking-wide text-subtext0/80 uppercase">
								<th class="py-2 pr-4 font-semibold">Item</th>
								<th class="py-2 pr-4 font-semibold">Qty</th>
								<th class="py-2 pr-4 font-semibold">Unit price</th>
								<th class="py-2 pr-4 font-semibold">Total</th>
							</tr>
						</thead>
						<tbody>
							{#if cartBreakdown.length}
								{#each cartBreakdown as line (line.item.id)}
									<tr class="divide-y divide-overlay0/10">
										<td class="py-2 pr-4">
											<div class="flex flex-col gap-0.5">
												<span class="font-medium text-text">{line.item.title}</span>
												<span class="text-xs tracking-wide text-subtext0/80 uppercase">
													{line.item.shopType === 'blackMarket' ? 'Black Market' : 'Regular Shop'}
												</span>
											</div>
										</td>
										<td class="py-2 pr-4 text-center text-text">{line.count}</td>
										<td class="py-2 pr-4">
											<div class="flex items-center gap-1 text-text">
												<img height="16" width="16" src={SHELL_ICON} alt="shell icon" class="inline-block" />
												<span>{formatNumber(line.unitPrice)}</span>
											</div>
										</td>
										<td class="py-2 pr-4">
											<div class="flex items-center gap-1 font-semibold text-text">
												<img height="16" width="16" src={SHELL_ICON} alt="shell icon" class="inline-block" />
												<span>{formatNumber(line.total)}</span>
											</div>
										</td>
									</tr>
								{/each}
							{:else}
								<tr>
									<td colspan="4" class="py-6 text-center text-subtext0">
										Your cart is empty. Add items to see them here.
									</td>
								</tr>
							{/if}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	{/if}

	<button
		type="button"
		class="fixed cursor-pointer top-6 left-6 z-30 rounded-full bg-blue p-4 text-crust shadow transition hover:bg-ctp-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-mantle disabled:cursor-not-allowed disabled:opacity-60"
		aria-controls="cart-panel"
			aria-expanded={showCart}
			aria-label={showCart ? 'Hide cart summary' : 'Show cart summary'}
		onclick={() => {
			showCart = !showCart;
		}}
	>
		<LucideShoppingCart class="h-16 w-16" />
	</button>

	<div class="fixed top-6 right-6 z-30">
		<ThemeSwitcher />
	</div>
</main>
