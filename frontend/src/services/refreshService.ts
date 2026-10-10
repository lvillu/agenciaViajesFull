/**
 * Refresh Service
 * Renueva el access token usando la cookie HttpOnly refresh_token (POST /refresh).
 * Usa axios directamente (sin apiClient) para evitar reentrada del interceptor.
 * Single-flight: todas las peticiones concurrentes comparten un mismo refresh.
 */

import axios from 'axios';
import { ApiResponse } from '@/types/api';
import { AuthResponse } from '@/types/user';
import { useAuthStore } from '@/store/authStore';
import { setSessionHint } from '@/lib/sessionHint';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

let inflightRefresh: Promise<string | null> | null = null;

async function requestRefresh(): Promise<string | null> {
  try {
    const response = await axios.post<ApiResponse<AuthResponse>>(
      `${API_BASE_URL}/refresh`,
      {},
      {
        withCredentials: true,
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const data = response.data?.data;
    if (!response.data?.isSuccess || !data?.token) {
      return null;
    }

    const state = useAuthStore.getState();
    state.setAuth(data.token, data.userName, state.rememberMe);
    setSessionHint(state.rememberMe);

    return data.token;
  } catch {
    return null;
  }
}

/**
 * Intenta renovar el access token.
 * Resuelve con el token nuevo, o null si la sesión ya no es válida.
 */
export function refreshSession(): Promise<string | null> {
  if (!inflightRefresh) {
    inflightRefresh = requestRefresh().finally(() => {
      inflightRefresh = null;
    });
  }
  return inflightRefresh;
}
