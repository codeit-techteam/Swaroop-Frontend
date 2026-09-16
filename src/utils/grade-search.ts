import type { SellerMaterialFamily } from '@/constants/materials-taxonomy';
import type { MarketProduct } from '@/types/market';

export const SUGGESTION_PRODUCT_LIMIT = 8;
export const SUGGESTION_MATERIAL_LIMIT = 4;

export type GradeSearchSuggestions = {
  query: string;
  materials: SellerMaterialFamily[];
  products: MarketProduct[];
  totalProducts: number;
};

export type GradeSearchSuggestionItem =
  | { type: 'material'; id: string; material: SellerMaterialFamily }
  | { type: 'product'; id: string; product: MarketProduct }
  | { type: 'view-all'; id: string };

const tokenize = (query: string): string[] =>
  query
    .trim()
    .toLowerCase()
    .split(/[\s,]+/)
    .filter((token) => token.length > 0);

const productSearchHaystack = (product: MarketProduct): string => {
  const specs = product.technicalSpecs
    ? Object.values(product.technicalSpecs).filter(Boolean).join(' ')
    : '';

  return [
    product.name,
    product.grade,
    product.gradeCode,
    product.materialType,
    product.subCategory,
    product.category,
    product.categoryId,
    product.description,
    product.origin,
    product.warehouseLabel,
    product.casNumber,
    product.badge,
    specs,
    ...(product.applications ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
};

const fieldScore = (
  value: string | undefined,
  q: string,
  weights: { exact: number; prefix: number; word: number; includes: number },
): number => {
  if (!value) {
    return 0;
  }
  const v = value.toLowerCase();
  if (v === q) {
    return weights.exact;
  }
  if (v.startsWith(q)) {
    return weights.prefix;
  }
  const tokens = v.split(/[\s\-_/.,()]+/).filter(Boolean);
  if (tokens.some((token) => token.startsWith(q))) {
    return weights.word;
  }
  if (q.length >= 2 && v.includes(q)) {
    return weights.includes;
  }
  return 0;
};

export const matchesGradeQuery = (product: MarketProduct, query: string): boolean => {
  const tokens = tokenize(query);
  if (tokens.length === 0) {
    return true;
  }
  const haystack = productSearchHaystack(product);
  return tokens.every((token) => haystack.includes(token));
};

export const scoreProductMatch = (product: MarketProduct, query: string): number => {
  const q = query.trim().toLowerCase();
  if (!q) {
    return 0;
  }

  const shortQuery = q.length === 1;
  const best = shortQuery
    ? Math.max(
        fieldScore(product.gradeCode, q, { exact: 100, prefix: 88, word: 0, includes: 0 }),
        fieldScore(product.grade, q, { exact: 96, prefix: 84, word: 0, includes: 0 }),
        fieldScore(product.materialType, q, { exact: 90, prefix: 78, word: 0, includes: 0 }),
        fieldScore(product.category, q, { exact: 88, prefix: 76, word: 0, includes: 0 }),
        fieldScore(product.name, q, { exact: 82, prefix: 70, word: 0, includes: 0 }),
      )
    : Math.max(
        fieldScore(product.gradeCode, q, { exact: 100, prefix: 88, word: 72, includes: 42 }),
        fieldScore(product.grade, q, { exact: 96, prefix: 84, word: 70, includes: 40 }),
        fieldScore(product.materialType, q, { exact: 90, prefix: 78, word: 64, includes: 36 }),
        fieldScore(product.category, q, { exact: 88, prefix: 76, word: 62, includes: 34 }),
        fieldScore(product.name, q, { exact: 82, prefix: 70, word: 58, includes: 32 }),
        fieldScore(product.subCategory, q, { exact: 76, prefix: 62, word: 50, includes: 28 }),
        fieldScore(product.casNumber, q, { exact: 70, prefix: 50, word: 40, includes: 24 }),
        fieldScore((product.applications ?? []).join(' '), q, {
          exact: 50,
          prefix: 40,
          word: 34,
          includes: 18,
        }),
        q.length >= 3
          ? fieldScore(product.description, q, { exact: 0, prefix: 0, word: 16, includes: 12 })
          : 0,
      );

  if (best <= 0 && matchesGradeQuery(product, q)) {
    return 8 + product.stock / 10000;
  }

  if (best <= 0) {
    return 0;
  }

  return best + product.stock / 10000;
};

export const scoreMaterialMatch = (material: SellerMaterialFamily, query: string): number => {
  const q = query.trim().toLowerCase();
  if (!q) {
    return 0;
  }

  return Math.max(
    fieldScore(material.code, q, { exact: 100, prefix: 90, word: 70, includes: 40 }),
    fieldScore(material.name, q, { exact: 92, prefix: 80, word: 64, includes: 36 }),
    fieldScore(material.parentGroup, q, { exact: 60, prefix: 40, word: 30, includes: 16 }),
  );
};

export const searchProductsByGrade = (
  products: MarketProduct[],
  query: string,
): MarketProduct[] => {
  const q = query.trim().toLowerCase();
  const matched = products.filter((product) => matchesGradeQuery(product, query));

  if (!q) {
    return matched;
  }

  return [...matched].sort((left, right) => {
    const scoreDelta = scoreProductMatch(right, q) - scoreProductMatch(left, q);
    if (scoreDelta !== 0) {
      return scoreDelta;
    }
    return right.stock - left.stock;
  });
};

export const getGradeSearchSuggestions = (
  products: MarketProduct[],
  materials: SellerMaterialFamily[],
  query: string,
  options?: {
    productLimit?: number;
    materialLimit?: number;
  },
): GradeSearchSuggestions => {
  const q = query.trim().toLowerCase();
  const productLimit = options?.productLimit ?? SUGGESTION_PRODUCT_LIMIT;
  const materialLimit = options?.materialLimit ?? SUGGESTION_MATERIAL_LIMIT;

  if (!q) {
    return { query, materials: [], products: [], totalProducts: 0 };
  }

  const rankedProducts = products
    .filter((product) => scoreProductMatch(product, q) > 0 || matchesGradeQuery(product, q))
    .sort((left, right) => {
      const scoreDelta = scoreProductMatch(right, q) - scoreProductMatch(left, q);
      if (scoreDelta !== 0) {
        return scoreDelta;
      }
      return right.stock - left.stock;
    });

  const rankedMaterials = materials
    .filter((material) => scoreMaterialMatch(material, q) > 0)
    .sort((left, right) => {
      const scoreDelta = scoreMaterialMatch(right, q) - scoreMaterialMatch(left, q);
      if (scoreDelta !== 0) {
        return scoreDelta;
      }
      return right.gradeCount - left.gradeCount;
    });

  return {
    query,
    materials: rankedMaterials.slice(0, materialLimit),
    products: rankedProducts.slice(0, productLimit),
    totalProducts: rankedProducts.length,
  };
};

export const flattenSearchSuggestions = (
  suggestions: GradeSearchSuggestions,
): GradeSearchSuggestionItem[] => {
  const items: GradeSearchSuggestionItem[] = suggestions.materials.map((material) => ({
    type: 'material',
    id: `material-${material.id}`,
    material,
  }));

  for (const product of suggestions.products) {
    items.push({
      type: 'product',
      id: `product-${product.id}`,
      product,
    });
  }

  if (suggestions.query.trim()) {
    items.push({ type: 'view-all', id: 'view-all' });
  }

  return items;
};

export const formatMarketPricePerMt = (pricePerMt: number): string =>
  `₹${Math.round(pricePerMt).toLocaleString('en-IN')}`;
