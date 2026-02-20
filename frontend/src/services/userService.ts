/**
 * User Service
 * Servicios relacionados con información del usuario
 */

import { apiClient } from './apiClient';
import { ApiResponse } from '@/types/api';
import { UserMeResponse, UpdateUserRequest } from '@/types/user';

const USER_ENDPOINTS = {
  ME: '/User/me',
  UPDATE: '/users',
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
};
