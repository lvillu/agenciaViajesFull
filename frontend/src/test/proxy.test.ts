import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '@/proxy';

function buildRequest(path: string, cookie?: string): NextRequest {
  return new NextRequest(`http://localhost:3000${path}`, {
    headers: cookie ? { cookie } : undefined,
  });
}

describe('proxy de rutas', () => {
  it('permite el acceso cuando existe la cookie-hint de sesión', () => {
    const response = proxy(buildRequest('/clientes', 'av_session=1'));
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('redirige al login conservando la ruta en returnTo', () => {
    const response = proxy(buildRequest('/reservas?tab=pagos'));

    expect(response.status).toBe(307);
    const location = new URL(response.headers.get('location')!);
    expect(location.pathname).toBe('/login');
    expect(location.searchParams.get('returnTo')).toBe('/reservas?tab=pagos');
  });

  it('redirige al login sin returnTo cuando la ruta es la raíz', () => {
    const response = proxy(buildRequest('/'));

    expect(response.status).toBe(307);
    const location = new URL(response.headers.get('location')!);
    expect(location.pathname).toBe('/login');
    expect(location.searchParams.get('returnTo')).toBeNull();
  });
});
