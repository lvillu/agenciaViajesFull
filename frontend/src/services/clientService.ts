/**
 * Client Service
 * Servicios de gestión de clientes
 */

import { apiClient } from './apiClient';
import { ApiResponse } from '@/types/api';
import { Client, CreateClientRequest, UpdateClientRequest } from '@/types/client';
import { CLIENT_ENDPOINTS } from '@/lib/constants';

export const clientService = {
  /**
   * Obtiene la lista de todos los clientes
   */
  async getAll(includeInactive: boolean = false): Promise<Client[]> {
    const response = await apiClient.get<ApiResponse<Client[]>>(
      CLIENT_ENDPOINTS.LIST,
      {
        params: { includeInactive },
      }
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al cargar clientes');
    }

    return response.data.data;
  },

  /**
   * Obtiene un cliente por ID
   */
  async getById(id: number): Promise<Client> {
    const response = await apiClient.get<ApiResponse<Client>>(
      CLIENT_ENDPOINTS.BY_ID(id)
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Cliente no encontrado');
    }

    return response.data.data;
  },

  /**
   * Crea un nuevo cliente
   */
  async create(client: CreateClientRequest): Promise<Client> {
    const response = await apiClient.post<ApiResponse<Client>>(
      CLIENT_ENDPOINTS.CREATE,
      client
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al crear cliente');
    }

    return response.data.data;
  },

  /**
   * Actualiza un cliente existente
   */
  async update(id: number, client: UpdateClientRequest): Promise<Client> {
    const response = await apiClient.put<ApiResponse<Client>>(
      CLIENT_ENDPOINTS.UPDATE(id),
      client
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al actualizar cliente');
    }

    return response.data.data;
  },

  /**
   * Elimina (da de baja) un cliente
   */
  async delete(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      CLIENT_ENDPOINTS.DELETE(id)
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al eliminar cliente');
    }
  },
};
