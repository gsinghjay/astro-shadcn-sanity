/**
 * Extracts a numeric price string from a display price like "$5,000/year".
 * Returns "0" for non-numeric values like "Free" or "Custom".
 */
export function extractNumericPrice(displayPrice: string): string {
  const cleaned = displayPrice
    .replace(/[€£$¥]/g, '')
    .replace(/,/g, '')
    .replace(/\/(year|yr|month|mo|week|wk|day|hr|hour)/gi, '')
    .trim();
  const match = cleaned.match(/[\d.]+/);
  return match ? match[0] : '0';
}

/**
 * Extracts a numeric value from a display string like "98%", "$2M", "50+".
 * Expands K/M/B suffixes.
 */
export function extractNumericValue(displayValue: string): string {
  const cleaned = displayValue.replace(/[€£$¥,+]/g, '').trim();
  const match = cleaned.match(/([\d.]+)\s*([KMBkmb])?/);
  if (!match) return '0';
  const num = parseFloat(match[1]);
  if (isNaN(num)) return '0';
  const suffix = (match[2] || '').toUpperCase();
  const multipliers: Record<string, number> = { K: 1_000, M: 1_000_000, B: 1_000_000_000 };
  const result = num * (multipliers[suffix] || 1);
  return String(result);
}

/**
 * Extracts a unit label from a display value string.
 * "98%" → "percent", "$2M" → "USD", "50+" → ""
 */
export function extractUnitText(displayValue: string): string {
  if (displayValue.includes('%')) return 'percent';
  if (displayValue.match(/^\s*\$/)) return 'USD';
  if (displayValue.match(/^\s*€/)) return 'EUR';
  if (displayValue.match(/^\s*£/)) return 'GBP';
  return '';
}
