import { describe, it, expect } from 'vitest';
import { CreateSaleSchema, UpdateSaleSchema } from './sale';

const validBase = {
  clientId: 1,
  providers: [{ providerId: 2, reservationNumber: 'RES-1' }],
  totalAmount: 10000,
  isDollar: false,
  travelDate: '2026-12-10',
};

describe('Sale schemas - desglose comisionable', () => {
  it.each([
    ['create', CreateSaleSchema, validBase],
    ['update', UpdateSaleSchema, { ...validBase, active: true }],
  ])('%s: sin desglose es válido sin monto comisionable', (_name, schema, data) => {
    expect(schema.safeParse(data).success).toBe(true);
  });

  it.each([
    ['create', CreateSaleSchema, validBase],
    ['update', UpdateSaleSchema, { ...validBase, active: true }],
  ])('%s: con desglose acepta monto comisionable menor o igual al total', (_name, schema, data) => {
    expect(schema.safeParse({ ...data, splitCommission: true, commissionableAmount: 4000 }).success).toBe(true);
    expect(schema.safeParse({ ...data, splitCommission: true, commissionableAmount: 10000 }).success).toBe(true);
  });

  it.each([
    ['create', CreateSaleSchema, validBase],
    ['update', UpdateSaleSchema, { ...validBase, active: true }],
  ])('%s: con desglose rechaza monto faltante o mayor al total', (_name, schema, data) => {
    const missing = schema.safeParse({ ...data, splitCommission: true });
    const over = schema.safeParse({ ...data, splitCommission: true, commissionableAmount: 10000.01 });
    expect(missing.success).toBe(false);
    expect(over.success).toBe(false);
    if (!over.success) {
      expect(over.error.issues[0].path).toEqual(['commissionableAmount']);
    }
  });

  it('rechaza monto comisionable negativo', () => {
    const result = CreateSaleSchema.safeParse({ ...validBase, splitCommission: true, commissionableAmount: -1 });
    expect(result.success).toBe(false);
  });
});

describe('Sale schemas - tipo de cambio (campo opcional)', () => {
  it.each([
    ['create', CreateSaleSchema, validBase],
    ['update', UpdateSaleSchema, { ...validBase, active: true }],
  ])('%s: en MXN acepta exchangeRate sin capturar (undefined, NaN o "")', (_name, schema, data) => {
    expect(schema.safeParse({ ...data, isDollar: false, exchangeRate: undefined }).success).toBe(true);
    expect(schema.safeParse({ ...data, isDollar: false, exchangeRate: NaN }).success).toBe(true);
    expect(schema.safeParse({ ...data, isDollar: false, exchangeRate: '' }).success).toBe(true);
  });

  it.each([
    ['create', CreateSaleSchema, validBase],
    ['update', UpdateSaleSchema, { ...validBase, active: true }],
  ])('%s: en USD acepta un tipo de cambio válido', (_name, schema, data) => {
    expect(schema.safeParse({ ...data, isDollar: true, exchangeRate: 20.5 }).success).toBe(true);
  });

  it.each([
    ['create', CreateSaleSchema, validBase],
    ['update', UpdateSaleSchema, { ...validBase, active: true }],
  ])('%s: en USD marca exchangeRate como pendiente si falta', (_name, schema, data) => {
    const result = schema.safeParse({ ...data, isDollar: true, exchangeRate: NaN });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'exchangeRate')).toBe(true);
    }
  });

  it('acepta numéricos opcionales vacíos sin fallar con "received NaN"', () => {
    const result = CreateSaleSchema.safeParse({
      ...validBase,
      profitPercentage: NaN,
      requiredDeposit: null,
      commissionableAmount: NaN,
    });
    expect(result.success).toBe(true);
  });
});
