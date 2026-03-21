/**
 * Dashboard Types
 * Tipos para el panel de control y estadísticas
 */

export interface DashboardSaleItem {
  id: number;
  clientName?: string;
  providerName?: string;
  reservationNumber?: string;
  description?: string;
  totalAmount: number;
  isDollar: boolean;
  totalPaid: number;
  remainingBalance: number;
  finalPaymentDueDate?: string;
  travelDate: string;
}

export interface DashboardCardsResponse {
  estimatedProfitCurrentMonth: number;
  pendingSettlementCount: number;
  pendingSettlementSales: DashboardSaleItem[];
  nearCancellationCount: number;
  nearCancellationSales: DashboardSaleItem[];
}

export interface ChartDataset {
  label?: string;
  data: number[];
  backgroundColor?: string[];
  borderColor?: string[];
  borderWidth?: number;
}

export interface ChartDataResponse {
  labels: string[];
  datasets: ChartDataset[];
}
