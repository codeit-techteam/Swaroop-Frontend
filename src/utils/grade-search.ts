import type { SellerMaterialFamily } from '@/constants/materials-taxonomy';
import type { CustomerGrade } from '@/types/grade-master';
import type { MarketProduct } from '@/types/market';

export const SUGGESTION_PRODUCT_LIMIT = 8;
export const SUGGESTION_MATERIAL_LIMIT = 4;
export const SUGGESTION_GRADE_LIMIT = 8;

export type GradeSearchSuggestions = {
  query: string;
  materials: SellerMaterialFamily[];
  products: MarketProduct[];
  /** Catalogue grades (Grade Master) for Amazon-style typeahead while typing. */
  grades: CustomerGrade[];
  totalProducts: number;
  totalGrades: number;
};

export type GradeSearchSuggestionItem =
  | { type: 'material'; id: string; material: SellerMaterialFamily }
  | { type: 'product'; id: string; product: MarketProduct }
  | { type: 'grade'; id: string; grade: CustomerGrade }
  | { type: 'view-all'; id: string };

/** Normalize chemical aliases so TIO2 / TiO₂ / titanium dioxide match (N-03). */
const normalizeSearchText = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/tio₂|tiо2|titanium\s*dioxide|titaniumdioxide/gi, 'tio2')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const SEARCH_ALIASES: Record<string, string[]> = {
  // Bare "tio" expands like TIO2 — never rely on substring "tio" ⊂ STYROLUTION.
  tio: ['tio2', 'titanium dioxide', 'white masterbatch', 'mb wh', 'mb-wh'],
  tio2: ['tio2', 'titanium dioxide', 'white masterbatch', 'mb wh', 'mb-wh'],
  masterbatch: ['masterbatch', 'mb', 'master batch'],
};

const tokenize = (query: string): string[] =>
  normalizeSearchText(query)
    .split(/\s+/)
    .filter((token) => token.length > 0);

const expandTokens = (tokens: string[]): string[] => {
  const expanded = new Set<string>();
  for (const token of tokens) {
    expanded.add(token);
    const aliases = SEARCH_ALIASES[token];
    if (aliases) {
      for (const alias of aliases) {
        for (const part of normalizeSearchText(alias).split(/\s+/)) {
          if (part) expanded.add(part);
        }
      }
    }
  }
  return [...expanded];
};

/**
 * Short tokens (≤3 chars) must match a whole word or word-prefix.
 * Avoids "tio" matching inside STYROLUTION / SOLUTION / RATIO.
 */
const haystackHasToken = (haystack: string, token: string): boolean => {
  if (!token) return false;
  const words = haystack.split(/\s+/).filter(Boolean);
  if (words.some((word) => word === token || word.startsWith(token))) {
    return true;
  }
  // Longer tokens may match mid-field (e.g. F4811 inside a long display name).
  return token.length >= 4 && haystack.includes(token);
};

const productSearchHaystack = (product: MarketProduct): string => {
  const specs = product.technicalSpecs
    ? Object.values(product.technicalSpecs).filter(Boolean).join(' ')
    : '';

  return normalizeSearchText(
    [
      product.name,
      product.grade,
      product.gradeCode,
      product.gradeNo,
      product.manufacturer,
      product.materialType,
      product.subCategory,
      product.category,
      product.masterCategoryName,
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
      .join(' '),
  );
};

const gradeSearchHaystack = (grade: CustomerGrade): string =>
  normalizeSearchText(
    [
      grade.name,
      grade.displayName,
      grade.code,
      grade.gradeNo,
      grade.manufacturer,
      grade.gradeGroup,
      grade.fullGradeName,
      grade.description,
      grade.category?.code,
      grade.category?.name,
      grade.category?.displayName,
    ]
      .filter(Boolean)
      .join(' '),
  );

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
  if (tokens.some((token) => token === q || token.startsWith(q))) {
    return weights.word;
  }
  // Short queries: never score mid-word substrings (tio ⊂ styrolution).
  if (q.length >= 4 && v.includes(q)) {
    return weights.includes;
  }
  return 0;
};

const tokenMatchesHaystack = (haystack: string, token: string): boolean => {
  if (haystackHasToken(haystack, token)) {
    return true;
  }
  const aliases = expandTokens([token]);
  return aliases.some((alias) => alias !== token && haystackHasToken(haystack, alias));
};

export const matchesGradeQuery = (product: MarketProduct, query: string): boolean => {
  const tokens = tokenize(query);
  if (tokens.length === 0) {
    return true;
  }
  const haystack = productSearchHaystack(product);
  return tokens.every((token) => tokenMatchesHaystack(haystack, token));
};

export const matchesCustomerGradeQuery = (grade: CustomerGrade, query: string): boolean => {
  const tokens = tokenize(query);
  if (tokens.length === 0) {
    return true;
  }
  const haystack = gradeSearchHaystack(grade);
  return tokens.every((token) => tokenMatchesHaystack(haystack, token));
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

export const scoreCustomerGradeMatch = (grade: CustomerGrade, query: string): number => {
  const q = query.trim().toLowerCase();
  if (!q) {
    return 0;
  }

  const best = Math.max(
    fieldScore(grade.gradeNo ?? undefined, q, { exact: 100, prefix: 90, word: 74, includes: 44 }),
    fieldScore(grade.code, q, { exact: 96, prefix: 86, word: 70, includes: 40 }),
    fieldScore(grade.displayName, q, { exact: 92, prefix: 80, word: 64, includes: 36 }),
    fieldScore(grade.name, q, { exact: 90, prefix: 78, word: 62, includes: 34 }),
    fieldScore(grade.fullGradeName ?? undefined, q, {
      exact: 88,
      prefix: 76,
      word: 60,
      includes: 32,
    }),
    fieldScore(grade.gradeGroup ?? undefined, q, { exact: 84, prefix: 72, word: 56, includes: 28 }),
    fieldScore(grade.category?.displayName, q, { exact: 70, prefix: 58, word: 46, includes: 22 }),
    fieldScore(grade.category?.code, q, { exact: 68, prefix: 56, word: 44, includes: 20 }),
    q.length >= 3
      ? fieldScore(grade.description ?? undefined, q, {
          exact: 0,
          prefix: 0,
          word: 16,
          includes: 12,
        })
      : 0,
  );

  if (best <= 0 && matchesCustomerGradeQuery(grade, q)) {
    return 8 + (grade.liveOfferCount ?? 0);
  }

  if (best <= 0) {
    return 0;
  }

  return best + (grade.liveOfferCount ?? 0) * 0.01;
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

export const rankCustomerGrades = (grades: CustomerGrade[], query: string): CustomerGrade[] => {
  const q = query.trim();
  if (!q) {
    return grades;
  }

  return [...grades]
    .filter((grade) => scoreCustomerGradeMatch(grade, q) > 0 || matchesCustomerGradeQuery(grade, q))
    .sort((left, right) => {
      const scoreDelta = scoreCustomerGradeMatch(right, q) - scoreCustomerGradeMatch(left, q);
      if (scoreDelta !== 0) {
        return scoreDelta;
      }
      return (right.liveOfferCount ?? 0) - (left.liveOfferCount ?? 0);
    });
};

export const getGradeSearchSuggestions = (
  products: MarketProduct[],
  materials: SellerMaterialFamily[],
  query: string,
  options?: {
    productLimit?: number;
    materialLimit?: number;
    gradeLimit?: number;
    grades?: CustomerGrade[];
  },
): GradeSearchSuggestions => {
  const q = query.trim().toLowerCase();
  const productLimit = options?.productLimit ?? SUGGESTION_PRODUCT_LIMIT;
  const materialLimit = options?.materialLimit ?? SUGGESTION_MATERIAL_LIMIT;
  const gradeLimit = options?.gradeLimit ?? SUGGESTION_GRADE_LIMIT;
  const catalogueGrades = options?.grades ?? [];

  if (!q) {
    return {
      query,
      materials: [],
      products: [],
      grades: [],
      totalProducts: 0,
      totalGrades: 0,
    };
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

  const rankedGrades = rankCustomerGrades(catalogueGrades, q);

  return {
    query,
    materials: rankedMaterials.slice(0, materialLimit),
    products: rankedProducts.slice(0, productLimit),
    grades: rankedGrades.slice(0, gradeLimit),
    totalProducts: rankedProducts.length,
    totalGrades: rankedGrades.length,
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

  for (const grade of suggestions.grades) {
    items.push({
      type: 'grade',
      id: `grade-${grade.id}`,
      grade,
    });
  }

  if (suggestions.query.trim()) {
    items.push({ type: 'view-all', id: 'view-all' });
  }

  return items;
};

export const formatMarketPricePerMt = (pricePerMt: number): string =>
  `₹${Math.round(pricePerMt).toLocaleString('en-IN')}`;
