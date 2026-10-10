import { describe, it, expect } from 'vitest';
import { formatCurrency } from './formatCurrency';

describe('formatCurrency', () => {
  it('formatea con MXN por defecto', () => {
    expect(formatCurrency(1500)).toBe('$1,500.00 MXN');
  });

  it('formatea con dos decimales siempre', () => {
    expect(formatCurrency(5)).toBe('$5.00 MXN');
  });

  it('usa USD cuando isDollar es true', () => {
    expect(formatCurrency(2500.5, true)).toBe('$2,500.50 USD');
  });

  it('usa MXN cuando isDollar es false', () => {
    expect(formatCurrency(2500.5, false)).toBe('$2,500.50 MXN');
  });

  it('acepta código de moneda explícito', () => {
    expect(formatCurrency(99.9, 'USD')).toBe('$99.90 USD');
    expect(formatCurrency(99.9, 'MXN')).toBe('$99.90 MXN');
  });

  it('redondea a dos decimales', () => {
    expect(formatCurrency(1234.567, 'USD')).toBe('$1,234.57 USD');
  });

  it('formatea separadores de miles', () => {
    expect(formatCurrency(1234567.89, 'USD')).toBe('$1,234,567.89 USD');
  });
});
