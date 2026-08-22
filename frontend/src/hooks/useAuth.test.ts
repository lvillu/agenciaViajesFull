import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock('@/services/userService', () => ({
  userService: {
    getMe: vi.fn(),
  },
}));

import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from './useAuth';

const mockedAuth = authService as unknown as Record<string, ReturnType<typeof vi.fn>>;
const mockedUser = userService as unknown as Record<string, ReturnType<typeof vi.fn>>;

const credentials = { userName: 'jperez', password: 'Secreta123!' };

describe('useAuth', () => {
  beforeEach(() => {
    Object.values(mockedAuth).forEach((fn) => fn.mockReset());
    Object.values(mockedUser).forEach((fn) => fn.mockReset());
    useAuthStore.setState({
      token: null,
      userName: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('login exitoso guarda el token en el store', async () => {
    mockedAuth.login.mockResolvedValue({ token: 'jwt-123', userName: 'jperez' });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login(credentials);
    });

    expect(mockedAuth.login).toHaveBeenCalledWith(credentials);
    expect(result.current.isAuthenticated).toBe(true);
    expect(useAuthStore.getState().token).toBe('jwt-123');
    expect(result.current.error).toBeNull();
  });

  it('login fallido lanza error y lo expone', async () => {
    mockedAuth.login.mockRejectedValue(new Error('credenciales inválidas'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await expect(result.current.login(credentials)).rejects.toThrow('credenciales inválidas');
    });

    expect(result.current.error).toBe('credenciales inválidas');
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('signup crea la cuenta y hace login automático', async () => {
    mockedAuth.signup.mockResolvedValue({ userName: 'jperez', token: '' });
    mockedAuth.login.mockResolvedValue({ token: 'jwt-nuevo', userName: 'jperez' });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signup({ ...credentials, name: 'Juan', lastName: 'Pérez', email: 'j@t.com', confirmPassword: credentials.password });
    });

    expect(mockedAuth.signup).toHaveBeenCalledTimes(1);
    expect(mockedAuth.login).toHaveBeenCalledWith(credentials);
    expect(useAuthStore.getState().token).toBe('jwt-nuevo');
  });

  it('fetchUserInfo guarda el usuario en el store', async () => {
    const me = { fullName: 'Juan Pérez', email: 'j@t.com', userName: 'jperez', userIconUrl: null };
    mockedUser.getMe.mockResolvedValue(me);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.fetchUserInfo();
    });

    expect(result.current.user).toEqual(me);
  });

  it('logout limpia el store aunque el servicio falle', async () => {
    useAuthStore.getState().setAuth('token-viejo', 'jperez');
    mockedAuth.logout.mockRejectedValue(new Error('red caída'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockedAuth.logout).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().token).toBeNull();
  });
});
