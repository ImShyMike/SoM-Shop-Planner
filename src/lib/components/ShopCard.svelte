<script lang="ts">
	import { selectedRegion } from '$lib/stores/region';
	import type { Region, ShopItem } from '$lib/api';
	import { balance } from '$lib/stores/balance';

	let currentRegion: Region;
	$: currentRegion = $selectedRegion;

	let currentBalance: number;
	$: currentBalance = $balance;

	export let item: ShopItem;
</script>

{#if item.prices[currentRegion]}
	<div
		class={`relative flex transform flex-col items-center gap-2 rounded border bg-base p-4 text-center text-text shadow transition-transform duration-300 ease-out hover:scale-[1.02] ${
			item.shopType === 'regular' ? 'border-ctp-subtext0/40' : 'border-ctp-yellow/40'
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
		<h3 class="font-bold">{item.title}</h3>
		<p class="text-subtext-0 mb-2">{item.description}</p>
		<img src={item.imageUrl} alt={item.title} class="mb-2 h-64 w-[90%] object-contain" />
		<a
			class="{currentBalance >= item.prices[currentRegion] ? "cursor-pointer bg-green hover:scale-[1.04] hover:bg-green/90 active:scale-95" : "cursor-not-allowed bg-red/70"} mt-auto inline-flex w-full transform-gpu items-center justify-center gap-1.5 rounded-md  p-2 font-medium text-crust transition duration-300 ease-out will-change-transform"
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
	</div>
{/if}
