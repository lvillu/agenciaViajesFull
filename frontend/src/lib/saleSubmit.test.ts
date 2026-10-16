import { describe, it, expect } from 'vitest';
import {
  collectPendingFields,
  needsProvider,
  normalizeSalePayload,
} from './saleSubmit';
import type { CreateSaleFormData } from '@/types/sale';

const baseForm = {
  clientId: 1,
  providers: [{ providerId: 2, reservationNumber: 'RES-1' }],
  description: 'Paquete prueba',
  totalAmount: 10000,
  isDollar: false,
  travelDate: '2026-12-10',
} as unknown as CreateSaleFormData;

describe('normalizeSalePayload', () => {
  it('convierte strings vacíos de fechas opcionales a undefined', () => {
    const payload = normalizeSalePayload({
      ...baseForm,
      returnDate: '',
      finalPaymentDueDate: '',
    } as unknown as CreateSaleFormData);
    expect(payload.returnDate).toBeUndefined();
    expect(payload.finalPaymentDueDate).toBeUndefined();
    expect(payload.travelDate).toBe('2026-12-10');
  });

  it('convierte NaN de numéricos opcionales a undefined', () => {
    const payload = normalizeSalePayload({
      ...baseForm,
      isDollar: true,
      exchangeRate: NaN,
      requiredDeposit: NaN,
      profitPercentage: NaN,
    } as unknown as CreateSaleFormData);
    expect(payload.exchangeRate).toBeUndefined();
    expect(payload.requiredDeposit).toBeUndefined();
    expect(payload.profitPercentage).toBeUndefined();
  });

  it('conserva valores válidos y filtra proveedores vacíos', () => {
    const payload = normalizeSalePayload({
      ...baseForm,
      providers: [
        { providerId: 0, reservationNumber: '' },
        { providerId: 5, reservationNumber: '  ABC-1  ' },
      ],
      exchangeRate: undefined,
      requiredDeposit: 2500,
    } as unknown as CreateSaleFormData);
    expect(payload.providers).toEqual([{ providerId: 5, reservationNumber: 'ABC-1' }]);
    expect(payload.requiredDeposit).toBe(2500);
  });

  it('omite commissionableAmount cuando no hay desglose', () => {
    const payload = normalizeSalePayload({
      ...baseForm,
      splitCommission: false,
      commissionableAmount: 4000,
    } as unknown as CreateSaleFormData);
    expect(payload.commissionableAmount).toBeUndefined();
    expect(payload).not.toHaveProperty('splitCommission');
  });
});

describe('collectPendingFields', () => {
  it('aplana errores anidados de providers con etiqueta legible', () => {
    const pending = collectPendingFields({
      providers: {
        0: { providerId: { message: 'El proveedor es inválido', type: 'too_small' } },
      },
    } as never);
    expect(pending).toHaveLength(1);
    expect(pending[0].key).toBe('providers.0.providerId');
    expect(pending[0].label).toContain('Proveedor');
    expect(needsProvider(pending)).toBe(true);
  });

  it('reporta error top-level de providers y otros campos', () => {
    const pending = collectPendingFields({
      clientId: { message: 'Debe seleccionar un cliente', type: 'too_small' },
      providers: { message: 'Debe agregar al menos un proveedor', type: 'too_small' },
      travelDate: { message: 'La fecha de viaje es requerida', type: 'too_small' },
    } as never);
    expect(pending.map((p) => p.key)).toEqual(['clientId', 'providers', 'travelDate']);
    expect(pending[0].label).toBe('Cliente titular');
    expect(needsProvider(pending)).toBe(true);
  });

  it('needsProvider es falso cuando no falta proveedor', () => {
    const pending = collectPendingFields({
      totalAmount: { message: 'El monto total debe ser mayor a 0', type: 'too_small' },
    } as never);
    expect(needsProvider(pending)).toBe(false);
  });
});
