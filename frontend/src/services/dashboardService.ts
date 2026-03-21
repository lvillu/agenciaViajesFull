/**
 * Dashboard Service
 * Servicios para obtener datos del panel de control
 */

import { apiClient } from './apiClient';
import { DASHBOARD_ENDPOINTS } from '@/lib/constants';
import { DashboardCardsResponse, ChartDataResponse } from '@/types/dashboard';

interface DashboardApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message?: string;
}

export const dashboardService = {
  async getCards(): Promise<DashboardCardsResponse> {
    const response = await apiClient.get<DashboardApiResponse<DashboardCardsResponse>>(
      DASHBOARD_ENDPOINTS.CARDS
    );
    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al cargar datos del dashboard');
    }
    return response.data.data;
  },

  async getMonthlySalesChart(): Promise<ChartDataResponse> {
    const response = await apiClient.get<DashboardApiResponse<ChartDataResponse>>(
      DASHBOARD_ENDPOINTS.CHART_MONTHLY_SALES
    );
    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al cargar gráfica de ventas');
    }
    return response.data.data;
  },

  async getSalesByProviderChart(): Promise<ChartDataResponse> {
    const response = await apiClient.get<DashboardApiResponse<ChartDataResponse>>(
      DASHBOARD_ENDPOINTS.CHART_SALES_BY_PROVIDER
    );
    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al cargar gráfica por proveedor');
    }
    return response.data.data;
  },

  async getMonthlyProfitsChart(): Promise<ChartDataResponse> {
    const response = await apiClient.get<DashboardApiResponse<ChartDataResponse>>(
      DASHBOARD_ENDPOINTS.CHART_MONTHLY_PROFITS
    );
    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al cargar gráfica de ganancias');
    }
    return response.data.data;
  },
};
