import type { CustomerGrade } from '@/types/grade-master';
import type { MarketProduct } from '@/types/market';
import { searchProductsByGrade } from '@/utils/grade-search';

export type MarketSearchRow =
  | { kind: 'product'; key: string; product: MarketProduct }
  | { kind: 'grade'; key: string; grade: CustomerGrade };

/**
 * Merge catalogue grade hits with in-memory live listings.
 * Prefer ProductCards when a live buyable listing exists for the grade;
 * otherwise keep the catalogue grade visible with “No live offers”.
 * Also append live listings that match the query client-side but were not
 * covered by the current catalogue page (e.g. product description hits).
 */
export function buildMarketSearchRows(
  grades: CustomerGrade[],
  liveProducts: MarketProduct[],
  query?: string,
): MarketSearchRow[] {
  const productsByGradeId = new Map<string, MarketProduct[]>();
  for (const product of liveProducts) {
    const gradeId = product.gradeId?.trim();
    if (!gradeId) continue;
    const bucket = productsByGradeId.get(gradeId);
    if (bucket) {
      bucket.push(product);
    } else {
      productsByGradeId.set(gradeId, [product]);
    }
  }

  const rows: MarketSearchRow[] = [];
  const seenProductIds = new Set<string>();

  for (const grade of grades) {
    const live = productsByGradeId.get(grade.id) ?? [];
    if (live.length > 0) {
      for (const product of live) {
        if (seenProductIds.has(product.id)) continue;
        seenProductIds.add(product.id);
        rows.push({ kind: 'product', key: `product:${product.id}`, product });
      }
      continue;
    }
    rows.push({ kind: 'grade', key: `grade:${grade.id}`, grade });
  }

  const trimmed = query?.trim();
  if (trimmed) {
    for (const product of searchProductsByGrade(liveProducts, trimmed)) {
      if (seenProductIds.has(product.id)) continue;
      seenProductIds.add(product.id);
      rows.push({ kind: 'product', key: `product:${product.id}`, product });
    }
  }

  return rows;
}
