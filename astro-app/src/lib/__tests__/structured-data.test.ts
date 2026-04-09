import { describe, test, expect } from 'vitest';
import { extractNumericPrice, extractNumericValue, extractUnitText } from '../structured-data';

describe('extractNumericPrice', () => {
  test('"$500" → "500"', () => {
    expect(extractNumericPrice('$500')).toBe('500');
  });

  test('"$5,000/year" → "5000"', () => {
    expect(extractNumericPrice('$5,000/year')).toBe('5000');
  });

  test('"$99/mo" → "99"', () => {
    expect(extractNumericPrice('$99/mo')).toBe('99');
  });

  test('"Free" → "0"', () => {
    expect(extractNumericPrice('Free')).toBe('0');
  });

  test('"Custom" → "0"', () => {
    expect(extractNumericPrice('Custom')).toBe('0');
  });

  test('"€1,200" → "1200"', () => {
    expect(extractNumericPrice('€1,200')).toBe('1200');
  });

  test('"$0" → "0"', () => {
    expect(extractNumericPrice('$0')).toBe('0');
  });

  test('"£99.99/month" → "99.99"', () => {
    expect(extractNumericPrice('£99.99/month')).toBe('99.99');
  });
});

describe('extractNumericValue', () => {
  test('"98%" → "98"', () => {
    expect(extractNumericValue('98%')).toBe('98');
  });

  test('"$2M" → "2000000"', () => {
    expect(extractNumericValue('$2M')).toBe('2000000');
  });

  test('"50+" → "50"', () => {
    expect(extractNumericValue('50+')).toBe('50');
  });

  test('"1,234" → "1234"', () => {
    expect(extractNumericValue('1,234')).toBe('1234');
  });

  test('"$500K" → "500000"', () => {
    expect(extractNumericValue('$500K')).toBe('500000');
  });

  test('"3.5B" → "3500000000"', () => {
    expect(extractNumericValue('3.5B')).toBe('3500000000');
  });

  test('"N/A" → "0"', () => {
    expect(extractNumericValue('N/A')).toBe('0');
  });
});

describe('extractUnitText', () => {
  test('"98%" → "percent"', () => {
    expect(extractUnitText('98%')).toBe('percent');
  });

  test('"$2M" → "USD"', () => {
    expect(extractUnitText('$2M')).toBe('USD');
  });

  test('"€500" → "EUR"', () => {
    expect(extractUnitText('€500')).toBe('EUR');
  });

  test('"£100" → "GBP"', () => {
    expect(extractUnitText('£100')).toBe('GBP');
  });

  test('"50+" → ""', () => {
    expect(extractUnitText('50+')).toBe('');
  });

  test('"1,234" → ""', () => {
    expect(extractUnitText('1,234')).toBe('');
  });
});
