import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';
import { UserMeResponse } from '@/types/user';

const initialState = {
  token: null,
  userName: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

const buildUser = (): UserMeResponse => ({
  fullName: 'Juan Pérez',
  email: 'juan@test.com',
  userName: 'jperez',
  userIconUrl: null,
});

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState(initialState);
  });

  it('tiene estado inicial vacío', () => {
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.userName).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('setAuth guarda token y marca autenticado', () => {
    useAuthStore.getState().setAuth('mi-token', 'jperez');
    const state = useAuthStore.getState();
    expect(state.token).toBe('mi-token');
    expect(state.userName).toBe('jperez');
    expect(state.isAuthenticated).toBe(true);
  });

  it('setUser guarda la información del usuario', () => {
    const user = buildUser();
    useAuthStore.getState().setUser(user);
    expect(useAuthStore.getState().user).toEqual(user);
  });

  it('setLoading actualiza isLoading', () => {
    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);
    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('logout limpia el estado de autenticación', () => {
    useAuthStore.getState().setAuth('token', 'jperez');
    useAuthStore.getState().setUser(buildUser());
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.userName).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('persiste el token en localStorage', () => {
    useAuthStore.getState().setAuth('token-persistido', 'jperez');
    const raw = localStorage.getItem('auth-storage');
    expect(raw).not.toBeNull();
    const persisted = JSON.parse(raw!);
    expect(persisted.state.token).toBe('token-persistido');
    expect(persisted.state.isAuthenticated).toBe(true);
  });
});
