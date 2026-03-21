/**
 * Auth Service
 * Servicios de autenticación: login, signup, logout
 */

import { apiClient } from './apiClient';
import { ApiResponse } from '@/types/api';
import { LoginRequest, SignUpRequest, AuthResponse, UserResponse } from '@/types/user';

const AUTH_ENDPOINTS = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  LOGOUT: '/logout',
};

export const authService = {
  /**
   * Inicia sesión con userName y password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      AUTH_ENDPOINTS.LOGIN,
      credentials
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al iniciar sesión');
    }

    return response.data.data;
  },

  /**
   * Crea un nuevo usuario
   */
  async signup(data: SignUpRequest): Promise<UserResponse> {
    const response = await apiClient.post<ApiResponse<UserResponse>>(
      AUTH_ENDPOINTS.SIGNUP,
      {
        name: data.name,
        lastName: data.lastName,
        userName: data.userName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      }
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al crear usuario');
    }

    return response.data.data;
  },

  /**
   * Cierra la sesión del usuario
   */
  async logout(): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(AUTH_ENDPOINTS.LOGOUT);

      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Error al cerrar sesión');
      }
    } catch (error) {
      // Incluso si falla, limpiamos el estado local
      console.error('Error al logout:', error);
    }
  },
};
