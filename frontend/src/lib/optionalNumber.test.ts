import { describe, it, expect } from 'vitest';
import { blankToUndefined, isBlankNumber, toOptionalNumber } from './optionalNumber';

describe('isBlankNumber', () => {
  it.each([
    ['string vacío', '', true],
    ['null', null, true],
    ['undefined', undefined, true],
    ['NaN', NaN, true],
    ['cero', 0, false],
    ['número', 20.5, false],
    ['string numérico', '20.5', false],
  ])('%s -> %s', (_name, value, expected) => {
    expect(isBlankNumber(value)).toBe(expected);
  });
});

describe('toOptionalNumber', () => {
  it('devuelve undefined para un input vacío (nunca NaN)', () => {
    expect(toOptionalNumber('')).toBeUndefined();
    expect(toOptionalNumber(NaN)).toBeUndefined();
    expect(toOptionalNumber(null)).toBeUndefined();
    expect(toOptionalNumber(undefined)).toBeUndefined();
  });

  it('convierte strings numéricos del input', () => {
    expect(toOptionalNumber('20.5')).toBe(20.5);
    expect(toOptionalNumber('0')).toBe(0);
  });

  it('conserva los números y el cero', () => {
    expect(toOptionalNumber(20.5)).toBe(20.5);
    expect(toOptionalNumber(0)).toBe(0);
  });
});

describe('blankToUndefined', () => {
  it('normaliza vacío, null y NaN a undefined', () => {
    expect(blankToUndefined('')).toBeUndefined();
    expect(blankToUndefined(null)).toBeUndefined();
    expect(blankToUndefined(NaN)).toBeUndefined();
  });

  it('deja pasar valores válidos intactos', () => {
    expect(blankToUndefined(0)).toBe(0);
    expect(blankToUndefined(20.5)).toBe(20.5);
    expect(blankToUndefined('texto')).toBe('texto');
  });
});
