import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('@/services/saleService', () => ({
  saleService: {
    getAll: vi.fn(),
    getByIdWithTotals: vi.fn(),
    delete: vi.fn(),
  },
}));

import { saleService } from '@/services/saleService';
import { useSales, useSale } from './useSales';

const mocked = saleService as unknown as Record<string, ReturnType<typeof vi.fn>>;

const buildSale = (id: number) => ({
  id,
  reservationNumber: `RES-2026-${String(id).padStart(3, '0')}`,
  clientId: 1,
  providerId: 1,
  totalAmount: 1000 * id,
  active: true,
});

describe('useSales', () => {
  beforeEach(() => {
    Object.values(mocked).forEach((fn) => fn.mockReset());
    mocked.getAll.mockResolvedValue([buildSale(1), buildSale(2)]);
  });

  it('carga ventas al montar', async () => {
    const { result } = renderHook(() => useSales());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.sales).toHaveLength(2);
    expect(result.current.error).toBeNull();
    expect(mocked.getAll).toHaveBeenCalledWith(false);
  });

  it('respeta includeInactive al montar', async () => {
    renderHook(() => useSales(true));

    await waitFor(() => expect(mocked.getAll).toHaveBeenCalledWith(true));
  });

  it('deleteSale elimina de la lista y retorna true', async () => {
    const { result } = renderHook(() => useSales());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mocked.delete.mockResolvedValue(undefined);

    let ok = false;
    await act(async () => {
      ok = await result.current.deleteSale(1);
    });

    expect(ok).toBe(true);
    expect(result.current.sales).toHaveLength(1);
    expect(result.current.sales[0].id).toBe(2);
  });

  it('deleteSale con error retorna false y expone el mensaje', async () => {
    const { result } = renderHook(() => useSales());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mocked.delete.mockRejectedValue(new Error('venta con pagos'));

    let ok = true;
    await act(async () => {
      ok = await result.current.deleteSale(3);
    });

    expect(ok).toBe(false);
    expect(result.current.error).toBe('venta con pagos');
  });
});

describe('useSale', () => {
  beforeEach(() => {
    Object.values(mocked).forEach((fn) => fn.mockReset());
  });

  it('carga la venta con totales por id', async () => {
    const conTotales = { ...buildSale(5), totalPaid: 500, remainingBalance: 4500 };
    mocked.getByIdWithTotals.mockResolvedValue(conTotales);

    const { result } = renderHook(() => useSale(5));

    await waitFor(() => expect(result.current.sale).not.toBeNull());
    expect(mocked.getByIdWithTotals).toHaveBeenCalledWith(5);
    expect(result.current.sale?.totalPaid).toBe(500);
    expect(result.current.loading).toBe(false);
  });

  it('no llama al servicio cuando el id es null', async () => {
    const { result } = renderHook(() => useSale(null));

    await act(async () => {
      await Promise.resolve();
    });

    expect(mocked.getByIdWithTotals).not.toHaveBeenCalled();
    expect(result.current.sale).toBeNull();
  });
});
