export const formatNumber = (value: number) =>
	Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 0 });

export const normalizePrice = (price: number | null | undefined) =>
	typeof price === 'number' && Number.isFinite(price) ? price : Number.POSITIVE_INFINITY;
