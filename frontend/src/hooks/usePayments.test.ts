import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('@/services/paymentService', () => ({
  paymentService: {
    getBySale: vi.fn(),
    delete: vi.fn(),
  },
}));

import { paymentService } from '@/services/paymentService';
import { usePayments } from './usePayments';

const mocked = paymentService as unknown as Record<string, ReturnType<typeof vi.fn>>;

const buildPayment = (id: number, amount: number) => ({
  id,
  saleId: 10,
  folioNumber: `F-${id}`,
  amount,
  active: true,
});

describe('usePayments', () => {
  beforeEach(() => {
    Object.values(mocked).forEach((fn) => fn.mockReset());
    mocked.getBySale.mockResolvedValue([buildPayment(1, 1000), buildPayment(2, 2500)]);
  });

  it('carga los pagos de la venta al montar', async () => {
    const { result } = renderHook(() => usePayments(10));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.payments).toHaveLength(2);
    expect(mocked.getBySale).toHaveBeenCalledWith(10);
  });

  it('no llama al servicio cuando saleId es null', async () => {
    const { result } = renderHook(() => usePayments(null));

    await act(async () => {
      await Promise.resolve();
    });

    expect(mocked.getBySale).not.toHaveBeenCalled();
    expect(result.current.payments).toHaveLength(0);
  });

  it('getTotalPaid suma los montos', async () => {
    const { result } = renderHook(() => usePayments(10));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.getTotalPaid()).toBe(3500);
  });

  it('deletePayment elimina de la lista y retorna true', async () => {
    const { result } = renderHook(() => usePayments(10));
    await waitFor(() => expect(result.current.loading).toBe(false));

    mocked.delete.mockResolvedValue(undefined);

    let ok = false;
    await act(async () => {
      ok = await result.current.deletePayment(1);
    });

    expect(ok).toBe(true);
    expect(result.current.payments).toHaveLength(1);
    expect(result.current.getTotalPaid()).toBe(2500);
  });

  it('deletePayment con error retorna false y expone el mensaje', async () => {
    const { result } = renderHook(() => usePayments(10));
    await waitFor(() => expect(result.current.loading).toBe(false));

    mocked.delete.mockRejectedValue(new Error('pago no encontrado'));

    let ok = true;
    await act(async () => {
      ok = await result.current.deletePayment(99);
    });

    expect(ok).toBe(false);
    expect(result.current.error).toBe('pago no encontrado');
  });
});
