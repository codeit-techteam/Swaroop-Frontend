export type SearchCategory =
  | 'all'
  | 'products'
  | 'orders'
  | 'offers'
  | 'shipments'
  | 'inventory'
  | 'documents';

export type SearchResultType =
  | 'product'
  | 'order'
  | 'offer'
  | 'shipment'
  | 'inventory'
  | 'document';

export type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  route: string;
  params?: Record<string, string>;
};

export type SearchSnapshot = {
  recentSearches: string[];
  popularSearches: string[];
};
