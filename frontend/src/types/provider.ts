/**
 * Provider Types
 * Basado en Provider.cs del backend
 */

export interface Provider {
  id: number;
  name: string;
  acronym: string;
  email: string;
  phone: string;
  providerContactName: string;
  depositPercentage?: number; // Porcentaje de anticipo requerido
  finalPaymentDaysBefore?: number; // Días antes del viaje para liquidación final
  active: boolean;
}

export interface CreateProviderRequest {
  name: string;
  acronym: string;
  email: string;
  phone: string;
  providerContactName: string;
  depositPercentage?: number;
  finalPaymentDaysBefore?: number;
}

export interface UpdateProviderRequest {
  name: string;
  acronym: string;
  email: string;
  phone: string;
  providerContactName: string;
  depositPercentage?: number;
  finalPaymentDaysBefore?: number;
  active: boolean;
}
