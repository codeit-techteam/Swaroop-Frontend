/** Central Grade Master (backend `/customer/marketplace/grades`, `/master-data/grades/*`). No prices. */

export type GradeCategoryRef = {
  id: string;
  code: string;
  name: string;
  displayName: string;
  parentGroup?: string | null;
};

export type CustomerGrade = {
  id: string;
  code: string;
  name: string;
  displayName: string;
  description: string | null;
  gradeGroup: string | null;
  gradeNo: string | null;
  manufacturer: string | null;
  fullGradeName: string | null;
  category: GradeCategoryRef | null;
  /** Missing on older backends; treat as unknown rather than zero. */
  liveOfferCount?: number;
};

export type GradeFacetCategory = {
  id: string;
  code: string;
  name: string;
  displayName: string;
  gradeCount: number;
};

export type GradeFacetBucket = {
  name: string;
  gradeCount: number;
};

export type GradeFacets = {
  categories: GradeFacetCategory[];
  gradeGroups: GradeFacetBucket[];
  manufacturers: GradeFacetBucket[];
};

export type MarketplaceGradeCategory = GradeFacetCategory & {
  parentGroup?: string | null;
};

export type GradeBrowseFilters = {
  search?: string;
  categoryId?: string | null;
  gradeGroup?: string | null;
  manufacturer?: string | null;
  hasOffers?: boolean;
};

export type GradePage<T> = {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
};

/** Live marketplace offer for a grade; seller identity is stripped by the backend. */
export type BlindGradeOffer = {
  id: string;
  referenceNumber: string | null;
  price: number;
  currency: string;
  unit: string;
  moq: number;
  quantityAvailable: number;
  packaging: string | null;
  region: string | null;
  deliveryTerms: string | null;
  validUntil: string | null;
  productId: string | null;
};
