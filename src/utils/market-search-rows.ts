import type { CustomerGrade } from '@/types/grade-master';
import type { MarketProduct } from '@/types/market';
import {
  rankCustomerGrades,
  scoreCustomerGradeMatch,
  scoreProductMatch,
  searchProductsByGrade,
} from '@/utils/grade-search';

export type MarketSearchRow =
  | { kind: 'product'; key: string; product: MarketProduct }
  | { kind: 'grade'; key: string; grade: CustomerGrade };

const rowScore = (row: MarketSearchRow, query: string): number => {
  if (row.kind === 'product') {
    return scoreProductMatch(row.product, query);
  }
  return scoreCustomerGradeMatch(row.grade, query);
};

/**
 * Merge catalogue grade hits with in-memory live listings.
 * Prefer ProductCards when a live buyable listing exists for the grade;
 * otherwise keep the catalogue grade visible with “No live offers”.
 * Also append live listings that match the query client-side but were not
 * covered by the current catalogue page (e.g. product description hits).
 * When a query is present, re-rank so true chemical hits (TIO / TIO2) float first.
 */
export function buildMarketSearchRows(
  grades: CustomerGrade[],
  liveProducts: MarketProduct[],
  query?: string,
): MarketSearchRow[] {
  const trimmed = query?.trim() ?? '';
  const orderedGrades = trimmed ? rankCustomerGrades(grades, trimmed) : grades;

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

  for (const grade of orderedGrades) {
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

  if (trimmed) {
    for (const product of searchProductsByGrade(liveProducts, trimmed)) {
      if (seenProductIds.has(product.id)) continue;
      seenProductIds.add(product.id);
      rows.push({ kind: 'product', key: `product:${product.id}`, product });
    }

    rows.sort((left, right) => {
      const scoreDelta = rowScore(right, trimmed) - rowScore(left, trimmed);
      if (scoreDelta !== 0) return scoreDelta;
      return left.key.localeCompare(right.key);
    });
  }

  return rows;
}
