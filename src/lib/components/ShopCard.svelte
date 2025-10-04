<script lang="ts">
	import type { Region, ShopItem } from '$lib/api';
	import { config } from '$lib/stores/config';
	import { cart, incrementItemCount } from '$lib/stores/cart';

	const currentRegion = $derived(($config.region ?? 'US') as Region);
	const currentBalance = $derived($config.balance ?? 0);
	const searchQuery = $derived($config.searchQuery?.trim() ?? '');

	const props = $props<{ item: ShopItem }>();
	let item: ShopItem = props.item;

	const amount = $derived($cart[item.id] ?? 0);

	function changeAmount(event: MouseEvent | KeyboardEvent, direction: 1 | -1) {
		const modifierActive = event.ctrlKey || event.metaKey;
		const step = modifierActive ? 10 : 1;
		const delta = step * direction;
		incrementItemCount(item.id, delta);
	}

	function highlightSearchTerm(text: string): string {
		const query = searchQuery;
		if (!query) return text;

		const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
		return text.replace(regex, '<mark class="bg-yellow/90">$1</mark>');
	}
</script>

{#if item.prices[currentRegion]}
	<div
		class={`relative flex transform flex-col items-center gap-2 rounded border bg-base p-4 text-center text-text shadow transition-transform duration-300 ease-out hover:scale-[1.02] ${
			props.item.shopType === 'regular' ? 'border-ctp-subtext0/40' : 'border-ctp-yellow/40'
		}`}
	>
		<div class="absolute top-4 right-4 flex items-center gap-1 text-lg">
			<img
				height="18"
				width="18"
				src="https://summer.hackclub.com/shell.avif"
				alt="shell icon"
				class="inline-block"
			/>
			<span class="font-medium">{item.prices[currentRegion]}</span>
		</div>
		{#if amount > 0}
			<div class="absolute top-4 left-4 flex items-center gap-1 text-lg">
				<span
					class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-lavender font-medium text-crust"
				>
					{amount}x
				</span>
			</div>
		{/if}
		<h3 class="font-bold">{@html highlightSearchTerm(item.title)}</h3>
		<p class="text-subtext-0 mb-2">{@html highlightSearchTerm(item.description)}</p>
		<img src={item.imageUrl} alt={item.title} class="mb-2 h-64 w-[90%] object-contain" />
		<div class="flex w-full flex-row gap-2">
			<a
				class="{currentBalance >= item.prices[currentRegion]
					? 'cursor-pointer bg-green hover:scale-[1.04] hover:bg-green/90 active:scale-95'
					: 'cursor-not-allowed bg-red/70'} mt-auto inline-flex w-full transform-gpu items-center justify-center gap-1.5 rounded-md p-2 font-medium text-crust transition duration-300 ease-out will-change-transform"
				href={item.purchaseUrl}
				target="_blank"
				rel="noopener noreferrer"
			>
				<span class="flex items-center gap-1">
					<span>Get for</span>
					<img
						height="18"
						width="18"
						src="https://summer.hackclub.com/shell.avif"
						alt="shell icon"
						class="h-[18px] w-[18px] flex-shrink-0"
					/>
					<span>{item.prices[currentRegion]} shells!</span>
				</span>
			</a>
			<button
				class="mt-auto inline-flex w-11 transform-gpu cursor-pointer items-center justify-center gap-1.5 rounded-md bg-blue/80 p-2 font-medium text-crust transition duration-300 ease-out will-change-transform hover:scale-[1.04] hover:bg-blue/70 active:scale-95"
				onclick={(event) => changeAmount(event, 1)}
			>
				+
			</button>
			<button
				class="mt-auto inline-flex w-11 transform-gpu cursor-pointer items-center justify-center gap-1.5 rounded-md bg-red/80 p-2 font-medium text-crust transition duration-300 ease-out will-change-transform hover:scale-[1.04] hover:bg-red/70 active:scale-95"
				onclick={(event) => changeAmount(event, -1)}
			>
				-
			</button>
		</div>
	</div>
{/if}
