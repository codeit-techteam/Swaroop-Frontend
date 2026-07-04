import { CURRENCY } from '@/constants';

export const formatCurrency = (
  amount: number,
  options?: {
    showSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  },
): string => {
  const { showSymbol = true, minimumFractionDigits = 2, maximumFractionDigits = 2 } = options ?? {};

  const formatted = new Intl.NumberFormat(CURRENCY.LOCALE, {
    style: 'currency',
    currency: CURRENCY.CODE,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);

  if (!showSymbol) {
    return formatted.replace(CURRENCY.SYMBOL, '').trim();
  }

  return formatted;
};

export const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const formatCompactCurrency = (amount: number): string => {
  if (amount >= 10000000) {
    return `${CURRENCY.SYMBOL}${(amount / 10000000).toFixed(2)}Cr`;
  }
  if (amount >= 100000) {
    return `${CURRENCY.SYMBOL}${(amount / 100000).toFixed(2)}L`;
  }
  if (amount >= 1000) {
    return `${CURRENCY.SYMBOL}${(amount / 1000).toFixed(2)}K`;
  }
  return formatCurrency(amount);
};
