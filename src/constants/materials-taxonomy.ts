/**
 * Source.one-style material families derived from the live catalog API.
 */

import type { MarketParentCategoryId, MarketProduct } from '@/types/market';

export const MATERIAL_PARENT_GROUPS = ['Polymers', 'Chemicals', 'Additives', 'Base Oils'] as const;

export type MaterialParentGroup = (typeof MATERIAL_PARENT_GROUPS)[number];

export type SellerMaterialFamily = {
  id: string;
  code: string;
  name: string;
  categoryId: MarketParentCategoryId;
  parentGroup: MaterialParentGroup;
  gradeCount: number;
  startingPrice: number;
  subCategories: string[];
};

const PARENT_BY_CATEGORY: Record<MarketParentCategoryId, MaterialParentGroup> = {
  polymers: 'Polymers',
  chemicals: 'Chemicals',
  additives: 'Additives',
  'base-oils': 'Base Oils',
};

const FAMILY_CODE_OVERRIDES: Record<string, string> = {
  Polypropylene: 'PP',
  Polycarbonate: 'PC',
  'Caustic Soda': 'CAUSTIC',
  'Maleic Anhydride': 'MA',
  'Ethyl Acetate': 'EA',
  'n-Butanol': 'NBA',
  'Base Oil': 'BASE OIL',
  Plasticizer: 'PLASTICIZER',
  Stabilizer: 'STABILIZER',
  Masterbatch: 'MB',
  Compound: 'COMPOUNDS',
  'PE Wax': 'PE WAX',
  'Caustic Soda Flakes': 'CAUSTIC',
};

const FAMILY_SORT_ORDER = [
  'Polypropylene',
  'HDPE',
  'LDPE',
  'LLDPE',
  'PVC',
  'PET',
  'ABS',
  'EVA',
  'Polycarbonate',
  'Nylon',
  'CPVC',
  'HIPS',
  'POM',
  'TPU',
  'Masterbatch',
  'Compound',
  'rPET',
  'rHDPE',
  'rLDPE',
  'rPP',
  'rABS',
];

function familyCode(materialType: string): string {
  return FAMILY_CODE_OVERRIDES[materialType] ?? materialType.toUpperCase();
}

function familyId(materialType: string): string {
  return `mat-${materialType.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

export function materialsFromCatalog(products: MarketProduct[]): SellerMaterialFamily[] {
  const buckets = new Map<string, MarketProduct[]>();

  products.forEach((product) => {
    const name = product.materialType || product.category;
    const current = buckets.get(name) ?? [];
    current.push(product);
    buckets.set(name, current);
  });

  const families = Array.from(buckets.entries()).map(([name, grades]) => {
    const categoryId = (grades[0]?.categoryId ?? 'polymers') as MarketParentCategoryId;
    const prices = grades.map((grade) => grade.price).filter((price) => price > 0);

    return {
      id: familyId(name),
      code: familyCode(name),
      name,
      categoryId,
      parentGroup: PARENT_BY_CATEGORY[categoryId] ?? 'Polymers',
      gradeCount: grades.length,
      startingPrice: prices.length > 0 ? Math.min(...prices) : 0,
      subCategories: Array.from(
        new Set(grades.map((grade) => grade.subCategory).filter((value): value is string => Boolean(value))),
      ),
    } satisfies SellerMaterialFamily;
  });

  return families.sort((left, right) => {
    const leftRank = FAMILY_SORT_ORDER.indexOf(left.name);
    const rightRank = FAMILY_SORT_ORDER.indexOf(right.name);
    const normalizedLeft = leftRank === -1 ? FAMILY_SORT_ORDER.length : leftRank;
    const normalizedRight = rightRank === -1 ? FAMILY_SORT_ORDER.length : rightRank;
    if (normalizedLeft !== normalizedRight) {
      return normalizedLeft - normalizedRight;
    }
    if (left.parentGroup !== right.parentGroup) {
      return MATERIAL_PARENT_GROUPS.indexOf(left.parentGroup) - MATERIAL_PARENT_GROUPS.indexOf(right.parentGroup);
    }
    return left.code.localeCompare(right.code);
  });
}

export const SELLER_CATALOG_PARENT_FILTERS = ['All', ...MATERIAL_PARENT_GROUPS] as const;

export function getMaterialFamilyByName(
  name: string,
  families: SellerMaterialFamily[],
): SellerMaterialFamily | undefined {
  return families.find(
    (family) => family.name.toLowerCase() === name.toLowerCase() || family.code.toLowerCase() === name.toLowerCase(),
  );
}

export function getMaterialsByParentGroup(
  products: MarketProduct[],
  parentGroup: MaterialParentGroup | 'All' | string,
): SellerMaterialFamily[] {
  const families = materialsFromCatalog(products);
  if (parentGroup === 'All') {
    return families;
  }
  return families.filter((family) => family.parentGroup === parentGroup);
}

export function getCatalogGradesForFamily(
  products: MarketProduct[],
  familyName: string,
  subCategory?: string | null,
): MarketProduct[] {
  return products.filter((product) => {
    const material = product.materialType || product.category;
    if (material.toLowerCase() !== familyName.toLowerCase()) {
      return false;
    }
    if (!subCategory || subCategory === 'All') {
      return true;
    }
    return (product.subCategory ?? '').toLowerCase() === subCategory.toLowerCase();
  });
}

export function searchCatalogGrades(products: MarketProduct[], query: string): MarketProduct[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return products.filter((product) =>
    [
      product.name,
      product.grade,
      product.gradeCode,
      product.materialType,
      product.subCategory,
      product.category,
      product.technicalSpecs?.mfi,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalized)),
  );
}
