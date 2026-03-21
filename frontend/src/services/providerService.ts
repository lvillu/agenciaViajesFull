/**
 * Provider Service
 * Servicios de gestión de proveedores
 */

import { apiClient } from './apiClient';
import { ApiResponse } from '@/types/api';
import { Provider, CreateProviderRequest, UpdateProviderRequest } from '@/types/provider';
import { PROVIDER_ENDPOINTS } from '@/lib/constants';

export const providerService = {
  /**
   * Obtiene la lista de todos los proveedores
   */
  async getAll(includeInactive: boolean = false): Promise<Provider[]> {
    const response = await apiClient.get<ApiResponse<Provider[]>>(
      PROVIDER_ENDPOINTS.LIST,
      {
        params: { includeInactive },
      }
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al cargar proveedores');
    }

    return response.data.data;
  },

  /**
   * Obtiene un proveedor por ID
   */
  async getById(id: number): Promise<Provider> {
    const response = await apiClient.get<ApiResponse<Provider>>(
      PROVIDER_ENDPOINTS.BY_ID(id)
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Proveedor no encontrado');
    }

    return response.data.data;
  },

  /**
   * Crea un nuevo proveedor
   */
  async create(provider: CreateProviderRequest): Promise<Provider> {
    const response = await apiClient.post<ApiResponse<Provider>>(
      PROVIDER_ENDPOINTS.CREATE,
      provider
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al crear proveedor');
    }

    return response.data.data;
  },

  /**
   * Actualiza un proveedor existente
   */
  async update(id: number, provider: UpdateProviderRequest): Promise<Provider> {
    const response = await apiClient.put<ApiResponse<Provider>>(
      PROVIDER_ENDPOINTS.UPDATE(id),
      provider
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al actualizar proveedor');
    }

    return response.data.data;
  },

  /**
   * Elimina (da de baja) un proveedor
   */
  async delete(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      PROVIDER_ENDPOINTS.DELETE(id)
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al eliminar proveedor');
    }
  },
};
