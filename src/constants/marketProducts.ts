import type { MarketCategory, MarketProduct, StockLevel } from '@/types/market';

export const MARKET_SEARCH_PLACEHOLDER = 'Search material grades (e.g. HDPE, PVC...)';

export const MARKET_LOCATION_LABEL = 'Mumbai, MH';

export const MARKET_CATEGORIES: MarketCategory[] = ['Polypropylene', 'HDPE', 'PVC', 'LLDPE', 'PET'];

export const MARKET_PRODUCTS: MarketProduct[] = [
  {
    id: 'mkt-pp-h110ma',
    name: 'H110MA Homopolymer',
    grade: 'PP',
    price: 94500,
    origin: 'Jamnagar, GJ',
    stock: 850,
    moq: 12,
    eta: '2–3 Days',
    category: 'Polypropylene',
    badge: 'Fastest Delivery',
    image:
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'mkt-hdpe-f1002',
    name: 'Polysure F1002',
    grade: 'HDPE',
    price: 91200,
    origin: 'Bathinda, PB',
    stock: 1100,
    moq: 18,
    eta: '5–7 Days',
    category: 'HDPE',
    badge: 'Lowest Cost',
    image:
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'mkt-pvc-s65',
    name: 'S-65 Suspension Grade',
    grade: 'PVC',
    price: 98750,
    origin: 'Dahej, GJ',
    stock: 40,
    moq: 10,
    eta: '2–4 Days',
    category: 'PVC',
    badge: 'Premium Grade',
    image:
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'mkt-hdpe-m6007',
    name: 'HDPE M6007',
    grade: 'HDPE',
    price: 96800,
    origin: 'Hazira, GJ',
    stock: 620,
    moq: 14,
    eta: '3–5 Days',
    category: 'HDPE',
    badge: 'Best Value',
    image:
      'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'mkt-lldpe-f24005',
    name: 'LLDPE F24005',
    grade: 'LLDPE',
    price: 98500,
    origin: 'Mundra, GJ',
    stock: 340,
    moq: 16,
    eta: '3–5 Days',
    category: 'LLDPE',
    badge: 'High Demand',
    image:
      'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'mkt-pet-resin',
    name: 'PET Resin Bottle Grade',
    grade: 'PET',
    price: 89200,
    origin: 'Panipat, HR',
    stock: 780,
    moq: 12,
    eta: '4–6 Days',
    category: 'PET',
    badge: 'Lowest Cost',
    image:
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'mkt-pp-raffia',
    name: 'PP Raffia Grade',
    grade: 'PP',
    price: 92800,
    origin: 'Jamnagar, GJ',
    stock: 520,
    moq: 15,
    eta: '2–3 Days',
    category: 'Polypropylene',
    badge: 'Fastest Delivery',
    image:
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'mkt-hdpe-pipe',
    name: 'HDPE Pipe Grade',
    grade: 'HDPE',
    price: 102400,
    origin: 'Hazira, GJ',
    stock: 95,
    moq: 20,
    eta: '5–7 Days',
    category: 'HDPE',
    badge: 'Limited Stock',
    image:
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'mkt-pvc-k67',
    name: 'PVC K67 Resin',
    grade: 'PVC',
    price: 82000,
    origin: 'Dahej, GJ',
    stock: 910,
    moq: 10,
    eta: '3–5 Days',
    category: 'PVC',
    badge: 'Best Value',
    image:
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'mkt-pc-resin',
    name: 'Polycarbonate Clear Grade',
    grade: 'PC',
    price: 186500,
    origin: 'Mundra, GJ',
    stock: 120,
    moq: 8,
    eta: '5–7 Days',
    category: 'Polycarbonate',
    badge: 'Premium Grade',
    image:
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'mkt-abs-resin',
    name: 'ABS Resin Injection Grade',
    grade: 'ABS',
    price: 124800,
    origin: 'Panipat, HR',
    stock: 260,
    moq: 12,
    eta: '4–6 Days',
    category: 'ABS',
    badge: 'High Demand',
    image:
      'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'mkt-eva-resin',
    name: 'EVA Resin Film Grade',
    grade: 'EVA',
    price: 118200,
    origin: 'Bathinda, PB',
    stock: 55,
    moq: 10,
    eta: '3–5 Days',
    category: 'EVA',
    badge: 'Limited Stock',
    image:
      'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'mkt-pp-copolymer',
    name: 'PP Impact Copolymer',
    grade: 'PP',
    price: 97200,
    origin: 'Jamnagar, GJ',
    stock: 430,
    moq: 14,
    eta: '2–3 Days',
    category: 'Polypropylene',
    badge: 'Best Value',
    image:
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'mkt-lldpe-rotomold',
    name: 'LLDPE Rotomolding Grade',
    grade: 'LLDPE',
    price: 101500,
    origin: 'Hazira, GJ',
    stock: 180,
    moq: 16,
    eta: '4–6 Days',
    category: 'LLDPE',
    badge: 'Fastest Delivery',
    image:
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'mkt-pet-fiber',
    name: 'PET Fiber Grade',
    grade: 'PET',
    price: 87500,
    origin: 'Dahej, GJ',
    stock: 640,
    moq: 18,
    eta: '5–7 Days',
    category: 'PET',
    badge: 'Lowest Cost',
    image:
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=600&q=80',
  },
];

export const getMarketProductById = (id: string): MarketProduct | undefined =>
  MARKET_PRODUCTS.find((product) => product.id === id);

export const formatMarketPrice = (price: number): string => `₹${price.toLocaleString('en-IN')}`;

export const formatStockLabel = (stock: number): string => `${stock.toLocaleString('en-IN')} MT`;

export const formatMoqLabel = (moq: number): string => `${moq} MT`;

export const getStockLevel = (stock: number): StockLevel => {
  if (stock >= 500) {
    return 'high';
  }
  if (stock >= 100) {
    return 'medium';
  }
  return 'low';
};
