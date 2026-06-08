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
  rememberMe: boolean;
  avatarVersion: number;

  // Acciones
  setAuth: (token: string, userName: string, rememberMe?: boolean) => void;
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
      rememberMe: false,
      avatarVersion: 0,

      setAuth: (token, userName, rememberMe = false) =>
        set({
          token,
          userName,
          isAuthenticated: true,
          rememberMe,
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
          rememberMe: false,
          avatarVersion: 0,
        }),

      bumpAvatarVersion: () =>
        set((state) => ({ avatarVersion: state.avatarVersion + 1 })),
    }),
    {
      name: 'auth-storage',
      version: 1,
      // Solo se persisten datos de sesión: nunca estado transitorio (isLoading)
      partialize: (state) => ({
        token: state.token,
        userName: state.userName,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
        avatarVersion: state.avatarVersion,
      }),
      migrate: (persistedState) => {
        const persisted = (persistedState ?? {}) as Partial<AuthState>;
        return {
          ...persisted,
          isAuthenticated: persisted.isAuthenticated ?? false,
          rememberMe: persisted.rememberMe ?? false,
          avatarVersion: persisted.avatarVersion ?? 0,
          isLoading: false,
        } as AuthState;
      },
    }
  )
);
