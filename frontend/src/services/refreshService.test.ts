import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('axios', () => ({
  default: { post: vi.fn() },
}));

import axios from 'axios';
import { refreshSession } from './refreshService';
import { useAuthStore } from '@/store/authStore';

const mockedPost = axios.post as unknown as ReturnType<typeof vi.fn>;

const successResponse = {
  data: {
    data: { userName: 'jperez', token: 'token-nuevo' },
    status: 'Completed',
    message: '',
    isSuccess: true,
  },
};

describe('refreshService', () => {
  beforeEach(() => {
    mockedPost.mockReset();
    localStorage.clear();
    useAuthStore.setState({
      token: 'token-viejo',
      userName: 'jperez',
      user: null,
      isAuthenticated: true,
      isLoading: false,
      rememberMe: true,
    });
  });

  it('renueva el token y actualiza el store conservando rememberMe', async () => {
    mockedPost.mockResolvedValue(successResponse);

    const token = await refreshSession();

    expect(token).toBe('token-nuevo');
    expect(useAuthStore.getState().token).toBe('token-nuevo');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().rememberMe).toBe(true);
    expect(mockedPost).toHaveBeenCalledTimes(1);
    expect(mockedPost).toHaveBeenCalledWith(
      expect.stringContaining('/refresh'),
      {},
      expect.objectContaining({ withCredentials: true })
    );
  });

  it('devuelve null cuando el refresh es rechazado (sesión vencida)', async () => {
    mockedPost.mockRejectedValue(new Error('401'));

    const token = await refreshSession();

    expect(token).toBeNull();
    expect(useAuthStore.getState().token).toBe('token-viejo');
  });

  it('devuelve null si la respuesta no trae token', async () => {
    mockedPost.mockResolvedValue({
      data: { data: null, status: 'Failure', message: 'Refresh token invalido.', isSuccess: false },
    });

    expect(await refreshSession()).toBeNull();
  });

  it('single-flight: las peticiones concurrentes comparten un mismo refresh', async () => {
    mockedPost.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(successResponse), 20))
    );

    const [first, second] = await Promise.all([refreshSession(), refreshSession()]);

    expect(first).toBe('token-nuevo');
    expect(second).toBe('token-nuevo');
    expect(mockedPost).toHaveBeenCalledTimes(1);
  });

  it('permite un nuevo refresh después de que termine el anterior', async () => {
    mockedPost.mockResolvedValue(successResponse);

    await refreshSession();
    await refreshSession();

    expect(mockedPost).toHaveBeenCalledTimes(2);
  });
});
