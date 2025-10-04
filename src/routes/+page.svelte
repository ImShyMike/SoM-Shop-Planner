<script lang="ts">
    import { onMount } from 'svelte';
    import { type ApiResponse, fetchData } from '$lib/api';
    import { selectedRegion, setRegion, REGION_OPTIONS } from '$lib/stores/region';
	import ShopCard from '$lib/components/ShopCard.svelte';

    let data: ApiResponse | undefined;
    let showBlackMarket = false;
    let showBadges = false;
    let filteredAndSorted: ApiResponse = [];

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
            .filter((shop) => showBadges || 107 >= shop.id && shop.id <= 115  )
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

<main class="p-4 bg-mantle flex flex-col min-h-screen items-center text-text">
    <div class="mb-4 text-center">
        <h1 class="text-4xl font-bold mb-2">SoM Shop Planner</h1>
        <p class="text-subtext0">Don't know what to buy? Worry no more!</p>
    </div>

    <div class="flex flex-row items-stretch gap-4 flex-wrap justify-center">
    <div class="flex flex-col self-stretch items-center text-text bg-ctp-base rounded p-4 border border-ctp-blue/70">
            <h2 class="pb-2">Selected region: <span class="text-red">{$selectedRegion}</span></h2>
            <div class="flex gap-2 flex-wrap text-subtext0">
                {#each REGION_OPTIONS as r}
                    <button class="bg-overlay0/20 p-2 rounded" onclick={() => setRegion(r)}>{r}</button>
                {/each}
            </div>
        </div>

    <div class="flex flex-col self-stretch items-center text-text bg-ctp-base rounded p-4 border border-ctp-blue/70">
            <h2 class="pb-2">Filter Options</h2>
            <label for="blackMarketToggle" class="flex items-center gap-2 cursor-pointer text-subtext0">
                <input type="checkbox" id="blackMarketToggle" bind:checked={showBlackMarket} class="accent-ctp-blue rounded bg-overlay0/80" />
                Show Black Market Items
            </label>
        </div>
    </div>
    
    <div class="mt-2 w-full">
        {#if data}
            {#if filteredAndSorted.length}
                <div class="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {#each filteredAndSorted as shop (shop.id)}
                        <ShopCard item={shop} />
                    {/each}
                </div>
            {:else}
                <p class="mt-4 text-subtext0">No shops match the selected filters.</p>
            {/if}
        {:else}
            <p>Loading...</p>
        {/if}
    </div>
</main>

