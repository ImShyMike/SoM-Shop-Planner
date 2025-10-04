<script lang="ts">
    import { selectedRegion } from '$lib/stores/region';
    import type { Region, ShopItem } from '$lib/api';

    let currentRegion: Region;
    $: currentRegion = $selectedRegion;

    export let item: ShopItem;
</script>

{#if item.prices[currentRegion]}
    <div class="relative border text-text p-2 px-4 text-center rounded shadow bg-base {item.shopType == 'regular' ? 'border-ctp-subtext0/40' : 'border-ctp-yellow/40'} flex flex-col items-center gap-2">
        <div class="absolute top-2 right-2 flex items-center gap-1">
            <img height="18" width="18" src="https://summer.hackclub.com/shell.avif" alt="shell icon" class="inline-block" />
            <span class="font-medium">{item.prices[currentRegion]}</span>
        </div>
        <h3 class="font-bold">{item.title}</h3>
        <p class="text-subtext-0">{item.description}</p>
        <img src={item.imageUrl} alt={item.title} class="w-16 h-16 object-contain" />
        <a class="text-crust bg-green rounded-md p-0.5 px-1 cursor-pointer inline-flex items-center" href={item.purchaseUrl} target="_blank" rel="noopener noreferrer">Get for <img height="18" width="18" src="https://summer.hackclub.com/shell.avif" alt="shell icon" class="inline-block ml-1 mr-0.5" />{item.prices[currentRegion]} shells!</a>
    </div>
{/if}