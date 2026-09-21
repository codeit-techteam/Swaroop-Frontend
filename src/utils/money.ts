export function moneyNumber(value: string | number | null | undefined): number | null {
  if (value == null || value === '') {
    return null;
  }
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

export function moneyNumberOrZero(value: string | number | null | undefined): number {
  return moneyNumber(value) ?? 0;
}
