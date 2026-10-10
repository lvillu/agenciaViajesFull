/**
 * useDashboard Hook
 * Manejo de estado y datos para el dashboard
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '@/services/dashboardService';
import { DashboardCardsResponse, ChartDataResponse } from '@/types/dashboard';

export const useDashboard = () => {
  const [cards, setCards] = useState<DashboardCardsResponse | null>(null);
  const [monthlySalesChart, setMonthlySalesChart] = useState<ChartDataResponse | null>(null);
  const [salesByProviderChart, setSalesByProviderChart] = useState<ChartDataResponse | null>(null);
  const [monthlyProfitsChart, setMonthlyProfitsChart] = useState<ChartDataResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cardsData, monthlySales, salesByProvider, monthlyProfits] = await Promise.all([
        dashboardService.getCards(),
        dashboardService.getMonthlySalesChart(),
        dashboardService.getSalesByProviderChart(),
        dashboardService.getMonthlyProfitsChart(),
      ]);
      setCards(cardsData);
      setMonthlySalesChart(monthlySales);
      setSalesByProviderChart(salesByProvider);
      setMonthlyProfitsChart(monthlyProfits);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar el dashboard';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Convencion del proyecto: carga inicial con funcion de refresh compartida.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
  }, [fetchAll]);

  return {
    cards,
    monthlySalesChart,
    salesByProviderChart,
    monthlyProfitsChart,
    loading,
    error,
    refresh: fetchAll,
  };
};
