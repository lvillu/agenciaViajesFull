/**
 * useAuth Hook
 * Hook personalizado para manejo de autenticación
 */

'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { LoginRequest, SignUpRequest } from '@/types/user';

export const useAuth = () => {
  const { setAuth, setUser, logout, ...authState } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (credentials: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      setAuth(response.token, response.userName);
      return response;
    } catch (err: any) {
      const message = err.message || 'Error al iniciar sesión';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignUpRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.signup(data);
      setAuth(response.token, response.userName);
      return response;
    } catch (err: any) {
      const message = err.message || 'Error al crear usuario';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const userInfo = await userService.getMe();
      setUser(userInfo);
      return userInfo;
    } catch (err: any) {
      const message = err.message || 'Error al obtener información del usuario';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.logout();
    } catch (err) {
      console.error('Error al logout:', err);
    } finally {
      logout();
      setLoading(false);
    }
  };

  return {
    ...authState,
    login,
    signup,
    logout: handleLogout,
    fetchUserInfo,
    error,
    loading,
    setError,
  };
};
