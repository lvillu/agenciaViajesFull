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
  active: boolean;
}

export interface CreateProviderRequest {
  name: string;
  acronym: string;
  email: string;
  phone: string;
  providerContactName: string;
}

export interface UpdateProviderRequest {
  name: string;
  acronym: string;
  email: string;
  phone: string;
  providerContactName: string;
  active: boolean;
}
