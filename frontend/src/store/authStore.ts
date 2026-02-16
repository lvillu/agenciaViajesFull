/**
 * Auth Store
 * Gestión del estado de autenticación con Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserMeResponse } from '@/types/user';

interface AuthState {
  // Estado
  token: string | null;
  userName: string | null;
  user: UserMeResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Acciones
  setAuth: (token: string, userName: string) => void;
  setUser: (user: UserMeResponse) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userName: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (token, userName) =>
        set({
          token,
          userName,
          isAuthenticated: true,
        }),

      setUser: (user) =>
        set({
          user,
        }),

      setLoading: (isLoading) =>
        set({
          isLoading,
        }),

      logout: () =>
        set({
          token: null,
          userName: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
