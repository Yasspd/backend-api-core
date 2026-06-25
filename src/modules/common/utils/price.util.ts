export const normalizePrice = (value: string): string | null => {
  const normalized = value
    .replace(/\s+/g, '')
    .replace(/,/g, '.')
    .replace(/[^\d.]/g, '');

  if (!normalized) {
    return null;
  }

  const numericValue = Number.parseFloat(normalized);
  if (Number.isNaN(numericValue)) {
    return null;
  }

  return numericValue.toFixed(2);
};
