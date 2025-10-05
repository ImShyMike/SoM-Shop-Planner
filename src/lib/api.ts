export type ShopItem = {
	title: string;
	imageUrl: string;
	description: string;
	purchaseUrl: string;
	id: number;
	shopType: ShopType;
	prices: {
		US: number;
		EU: number;
		IN: number;
		CA: number;
		AU: number;
		XX: number;
	};
	imageHash: string;
};

export type ApiResponse = ShopItem[];

export type ShopType = 'regular' | 'blackMarket';

export type Region = 'US' | 'EU' | 'IN' | 'CA' | 'AU' | 'XX';

export const REGIONS: Region[] = ['US', 'EU', 'IN', 'CA', 'AU', 'XX'];

export async function fetchData(): Promise<ApiResponse> {
	return fetch('https://summer.skyfall.dev/api/shop').then((res) =>
		res.json()
	);
}
