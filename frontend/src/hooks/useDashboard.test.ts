import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('@/services/dashboardService', () => ({
  dashboardService: {
    getCards: vi.fn(),
    getMonthlySalesChart: vi.fn(),
    getSalesByProviderChart: vi.fn(),
    getMonthlyProfitsChart: vi.fn(),
  },
}));

import { dashboardService } from '@/services/dashboardService';
import { useDashboard } from './useDashboard';

const mocked = dashboardService as unknown as Record<string, ReturnType<typeof vi.fn>>;

describe('useDashboard', () => {
  beforeEach(() => {
    Object.values(mocked).forEach((fn) => fn.mockReset());
    mocked.getCards.mockResolvedValue({
      estimatedProfitCurrentMonth: 50000,
      pendingSettlementCount: 3,
      nearCancellationCount: 1,
      salesLast12Months: [],
    });
    mocked.getMonthlySalesChart.mockResolvedValue({ labels: ['Ene'], datasets: [{ data: [100] }] });
    mocked.getSalesByProviderChart.mockResolvedValue({ labels: ['Prov A'], datasets: [{ data: [200] }] });
    mocked.getMonthlyProfitsChart.mockResolvedValue({ labels: ['Ene'], datasets: [{ data: [50] }] });
  });

  it('carga cards y los tres gráficos al montar', async () => {
    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.cards?.estimatedProfitCurrentMonth).toBe(50000);
    expect(result.current.monthlySalesChart?.labels).toEqual(['Ene']);
    expect(result.current.salesByProviderChart?.datasets[0]?.data).toEqual([200]);
    expect(result.current.monthlyProfitsChart?.labels).toEqual(['Ene']);
    expect(result.current.error).toBeNull();
  });

  it('refresh vuelve a consultar todos los endpoints', async () => {
    const { result } = renderHook(() => useDashboard());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.refresh();
    });

    expect(mocked.getCards).toHaveBeenCalledTimes(2);
    expect(mocked.getMonthlySalesChart).toHaveBeenCalledTimes(2);
    expect(mocked.getSalesByProviderChart).toHaveBeenCalledTimes(2);
    expect(mocked.getMonthlyProfitsChart).toHaveBeenCalledTimes(2);
  });

  it('expone el mensaje de error cuando un endpoint falla', async () => {
    mocked.getMonthlySalesChart.mockRejectedValue(new Error('chart caído'));

    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('chart caído');
  });

  it('usa mensaje genérico cuando el error no es Error', async () => {
    mocked.getCards.mockRejectedValue('boom');

    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Error al cargar el dashboard');
  });
});
