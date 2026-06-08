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
  avatarVersion: number;

  // Acciones
  setAuth: (token: string, userName: string) => void;
  setUser: (user: UserMeResponse) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  bumpAvatarVersion: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userName: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      avatarVersion: 0,

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
          avatarVersion: 0,
        }),

      bumpAvatarVersion: () =>
        set((state) => ({ avatarVersion: state.avatarVersion + 1 })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        userName: state.userName,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
