import { describe, it, expect, beforeEach } from 'vitest';
import {
  setSessionHint,
  clearSessionHint,
  getSessionHintMaxAge,
  SESSION_HINT_COOKIE,
} from './sessionHint';

describe('sessionHint', () => {
  beforeEach(() => {
    clearSessionHint();
  });

  it('getSessionHintMaxAge usa 30 días con rememberMe y 7 sin', () => {
    expect(getSessionHintMaxAge(true)).toBe(30 * 24 * 60 * 60);
    expect(getSessionHintMaxAge(false)).toBe(7 * 24 * 60 * 60);
  });

  it('setSessionHint crea la cookie de sesión', () => {
    setSessionHint(false);
    expect(document.cookie).toContain(`${SESSION_HINT_COOKIE}=1`);
  });

  it('clearSessionHint elimina la cookie de sesión', () => {
    setSessionHint(true);
    expect(document.cookie).toContain(`${SESSION_HINT_COOKIE}=1`);

    clearSessionHint();
    expect(document.cookie).not.toContain(`${SESSION_HINT_COOKIE}=1`);
  });
});
