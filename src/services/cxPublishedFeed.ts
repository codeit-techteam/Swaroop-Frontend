import type { MarketCategory, MarketProduct } from '@/types/market';

const CX_API_URL = process.env.EXPO_PUBLIC_CX_API_URL ?? 'http://localhost:3000';

type PublishedProduct = {
  id: string;
  name: string;
  grade: string;
  material: string;
  location: string;
  origin?: string;
  sellingPrice: number;
  availableQty: number;
  moq: number;
  etaLabel: string;
  images: string[];
  packaging?: string;
  stockIndicator: 'in_stock' | 'limited' | 'out_of_stock';
  bulkPrices?: Array<{ minQty: number; maxQty: number | null; price: number }>;
};

const CATEGORY_MAP: Record<string, MarketCategory> = {
  Polypropylene: 'Polypropylene',
  HDPE: 'HDPE',
  PVC: 'PVC',
  LLDPE: 'LLDPE',
  PET: 'PET',
};

function toMarketProduct(product: PublishedProduct): MarketProduct {
  return {
    id: product.id,
    name: product.name,
    grade: product.grade,
    price: product.sellingPrice,
    origin: product.origin || product.location,
    stock: product.availableQty,
    moq: product.moq,
    eta: product.etaLabel,
    category: CATEGORY_MAP[product.material] ?? 'Polypropylene',
    badge: product.stockIndicator === 'limited' ? 'Limited Stock' : 'Best Value',
    image: product.images[0] ?? '',
  };
}

let cache: MarketProduct[] = [];

export function getPublishedMarketProducts(): MarketProduct[] {
  return cache;
}

export async function hydratePublishedMarketProducts(): Promise<MarketProduct[]> {
  try {
    const response = await fetch(`${CX_API_URL}/api/cx/published`);
    if (!response.ok) return cache;
    const payload = (await response.json()) as { data?: { products?: PublishedProduct[] } };
    cache = (payload.data?.products ?? []).map(toMarketProduct);
    return cache;
  } catch {
    return cache;
  }
}
