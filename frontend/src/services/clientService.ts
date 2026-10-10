/**
 * Client Service
 * Servicios de gestión de clientes
 */

import { apiClient } from './apiClient';
import { ApiResponse, PagedResponse, PagedQuery, DEFAULT_PAGE_SIZE } from '@/types/api';
import { Client, CreateClientRequest, UpdateClientRequest } from '@/types/client';
import { CLIENT_ENDPOINTS } from '@/lib/constants';

export const clientService = {
  /**
   * Obtiene la página de clientes (backend paginado, Fase 3)
   */
  async getAll(
    includeInactive: boolean = false,
    query: PagedQuery = {}
  ): Promise<PagedResponse<Client>> {
    const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = query;
    const response = await apiClient.get<ApiResponse<PagedResponse<Client>>>(
      CLIENT_ENDPOINTS.LIST,
      {
        params: { includeInactive, page, pageSize },
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
