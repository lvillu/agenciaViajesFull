import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_HINT_COOKIE } from '@/lib/sessionHint';

/**
 * Protege las rutas privadas en el servidor.
 * Si no existe la cookie-hint de sesión, redirige al login conservando
 * la ruta actual en ?returnTo= para volver después de autenticarse.
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.get(SESSION_HINT_COOKIE)?.value === '1';

  if (hasSession) {
    return NextResponse.next();
  }

  const returnTo = request.nextUrl.pathname + request.nextUrl.search;
  const loginUrl = new URL('/login', request.url);

  if (returnTo && returnTo !== '/') {
    loginUrl.searchParams.set('returnTo', returnTo);
  }

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/',
    '/clientes/:path*',
    '/reservas/:path*',
    '/proveedores/:path*',
    '/dashboard/:path*',
    '/settings/:path*',
  ],
};
