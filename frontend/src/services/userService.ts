/**
 * User Service
 * Servicios relacionados con información del usuario
 */

import { apiClient } from './apiClient';
import { ApiResponse } from '@/types/api';
import { UserMeResponse, UpdateUserRequest } from '@/types/user';
import { SubAccount, CreateSubAccountRequest, UpdateSubAccountRequest } from '@/types/subAccount';

const USER_ENDPOINTS = {
  ME: '/User/me',
  UPDATE: '/users',
  AVATAR: '/User/avatar',
  SUBACCOUNTS: '/User/subaccounts',
};

export const userService = {
  /**
   * Obtiene la información del usuario autenticado
   */
  async getMe(): Promise<UserMeResponse> {
    const response = await apiClient.get<ApiResponse<UserMeResponse>>(USER_ENDPOINTS.ME);

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al obtener información del usuario');
    }

    return response.data.data;
  },

  /**
   * Sube/actualiza el avatar del usuario autenticado.
   * Envía el archivo como multipart/form-data.
   */
  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<string>>(
      USER_ENDPOINTS.AVATAR,
      formData,
      {
        headers: {
          // No definir Content-Type — axios lo autodetecta como multipart/form-data con boundary
        },
      }
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al subir avatar');
    }

    return response.data.data;
  },

  /**
   * Actualiza la información del usuario autenticado
   */
  async updateProfile(data: UpdateUserRequest): Promise<UserMeResponse> {
    const response = await apiClient.put<ApiResponse<UserMeResponse>>(
      USER_ENDPOINTS.UPDATE,
      data
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al actualizar perfil');
    }

    return response.data.data;
  },

  /**
   * Obtiene la lista de subcuentas
   */
  async getSubAccounts(): Promise<SubAccount[]> {
    const response = await apiClient.get<ApiResponse<SubAccount[]>>(USER_ENDPOINTS.SUBACCOUNTS);

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al obtener subcuentas');
    }

    return response.data.data;
  },

  /**
   * Crea una nueva subcuenta
   */
  async createSubAccount(data: CreateSubAccountRequest): Promise<SubAccount> {
    const response = await apiClient.post<ApiResponse<SubAccount>>(USER_ENDPOINTS.SUBACCOUNTS, data);

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al crear subcuenta');
    }

    return response.data.data;
  },

  /**
   * Actualiza una subcuenta
   */
  async updateSubAccount(id: number, data: UpdateSubAccountRequest): Promise<SubAccount> {
    const response = await apiClient.put<ApiResponse<SubAccount>>(`${USER_ENDPOINTS.SUBACCOUNTS}/${id}`, data);

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al actualizar subcuenta');
    }

    return response.data.data;
  },

  /**
   * Elimina una subcuenta
   */
  async deleteSubAccount(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`${USER_ENDPOINTS.SUBACCOUNTS}/${id}`);

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al eliminar subcuenta');
    }
  },
};
