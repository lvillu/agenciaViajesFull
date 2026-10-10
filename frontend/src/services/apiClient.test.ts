import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

vi.mock('@/services/refreshService', () => ({
  refreshSession: vi.fn(),
}));

import { refreshSession } from '@/services/refreshService';
import { apiClient } from './apiClient';
import { useAuthStore } from '@/store/authStore';

const mockedRefresh = refreshSession as unknown as ReturnType<typeof vi.fn>;

type Adapter = (config: InternalAxiosRequestConfig) => Promise<AxiosResponse>;

function build401(config: InternalAxiosRequestConfig): AxiosError {
  const error = new AxiosError(
    'Request failed with status code 401',
    'ERR_BAD_REQUEST',
    config
  );
  error.response = {
    status: 401,
    statusText: 'Unauthorized',
    headers: new AxiosHeaders(),
    config,
    data: { success: false, message: 'Tu sesión ha expirado.' },
  };
  return error;
}

function build200(config: InternalAxiosRequestConfig) {
  return {
    status: 200,
    statusText: 'OK',
    headers: new AxiosHeaders(),
    config,
    data: { data: 'ok', status: 'Completed', message: '', isSuccess: true },
  };
}

describe('apiClient - interceptor de refresh', () => {
  const originalAdapter = apiClient.defaults.adapter;

  beforeEach(() => {
    mockedRefresh.mockReset();
    localStorage.clear();
    useAuthStore.setState({
      token: 'token-viejo',
      userName: 'jperez',
      user: null,
      isAuthenticated: true,
      isLoading: false,
      rememberMe: false,
    });
  });

  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter;
  });

  it('ante un 401 renueva el token y reintenta la petición', async () => {
    mockedRefresh.mockImplementation(async () => {
      useAuthStore.getState().setAuth('token-nuevo', 'jperez', false);
      return 'token-nuevo';
    });

    const adapter = vi
      .fn<Adapter>()
      .mockImplementationOnce((config) => Promise.reject(build401(config)))
      .mockImplementationOnce((config) => Promise.resolve(build200(config)));
    apiClient.defaults.adapter = adapter;

    const response = await apiClient.get('/Client');

    expect(response.status).toBe(200);
    expect(mockedRefresh).toHaveBeenCalledTimes(1);
    expect(adapter).toHaveBeenCalledTimes(2);

    const retriedConfig = adapter.mock.calls[1][0];
    expect(retriedConfig.headers.Authorization).toBe('Bearer token-nuevo');
  });

  it('si el refresh falla rechaza la petición sin reintentar', async () => {
    mockedRefresh.mockResolvedValue(null);

    const adapter = vi
      .fn<Adapter>()
      .mockImplementationOnce((config) => Promise.reject(build401(config)));
    apiClient.defaults.adapter = adapter;

    await expect(apiClient.get('/Client')).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(mockedRefresh).toHaveBeenCalledTimes(1);
    expect(adapter).toHaveBeenCalledTimes(1);
  });

  it('no reintenta si el segundo intento también devuelve 401', async () => {
    mockedRefresh.mockResolvedValue('token-nuevo');

    const adapter = vi
      .fn<Adapter>()
      .mockImplementationOnce((config) => Promise.reject(build401(config)))
      .mockImplementationOnce((config) => Promise.reject(build401(config)));
    apiClient.defaults.adapter = adapter;

    await expect(apiClient.get('/Client')).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(mockedRefresh).toHaveBeenCalledTimes(1);
    expect(adapter).toHaveBeenCalledTimes(2);
  });

  it('no intenta refresh ante un 401 de los endpoints de autenticación', async () => {
    const adapter = vi
      .fn<Adapter>()
      .mockImplementationOnce((config) => Promise.reject(build401(config)));
    apiClient.defaults.adapter = adapter;

    await expect(apiClient.post('/login', {})).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(mockedRefresh).not.toHaveBeenCalled();
    expect(adapter).toHaveBeenCalledTimes(1);
  });
});
