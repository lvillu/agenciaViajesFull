/**
 * Session Hint
 * Cookie ligera (no httpOnly) que Next.js middleware puede leer en el servidor
 * para proteger rutas. La sesión real vive en la cookie HttpOnly del backend
 * (refresh_token) y el access token en el store de Zustand.
 */

export const SESSION_HINT_COOKIE = 'av_session';

const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;
const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60;

export const getSessionHintMaxAge = (rememberMe: boolean): number =>
  rememberMe ? THIRTY_DAYS_SECONDS : SEVEN_DAYS_SECONDS;

export function setSessionHint(rememberMe: boolean): void {
  if (typeof document === 'undefined') return;
  const maxAge = getSessionHintMaxAge(rememberMe);
  document.cookie = `${SESSION_HINT_COOKIE}=1; path=/; max-age=${maxAge}`;
}

export function clearSessionHint(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${SESSION_HINT_COOKIE}=; path=/; max-age=0`;
}
