import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('@/services/agencyInfoService', () => ({
  agencyInfoService: {
    getAgencyInfo: vi.fn(),
    updateAgencyInfo: vi.fn(),
  },
}));

import { agencyInfoService } from '@/services/agencyInfoService';
import { useAgencyInfo } from './useAgencyInfo';

const mocked = agencyInfoService as unknown as Record<string, ReturnType<typeof vi.fn>>;

const buildAgencyInfo = () => ({
  id: 1,
  name: 'Agencia Test',
  email: 'contacto@agencia.com',
  phone: '5512345678',
});

describe('useAgencyInfo', () => {
  beforeEach(() => {
    Object.values(mocked).forEach((fn) => fn.mockReset());
    mocked.getAgencyInfo.mockResolvedValue(buildAgencyInfo());
  });

  it('fetchAgencyInfo carga la información', async () => {
    const { result } = renderHook(() => useAgencyInfo());

    await act(async () => {
      await result.current.fetchAgencyInfo();
    });

    expect(result.current.agencyInfo?.name).toBe('Agencia Test');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('updateAgencyInfo actualiza el estado y retorna el valor', async () => {
    const { result } = renderHook(() => useAgencyInfo());

    const actualizada = { ...buildAgencyInfo(), name: 'Agencia Modificada' };
    mocked.updateAgencyInfo.mockResolvedValue(actualizada);

    let respuesta: unknown;
    await act(async () => {
      respuesta = await result.current.updateAgencyInfo({ name: 'Agencia Modificada' });
    });

    expect((respuesta as { name: string }).name).toBe('Agencia Modificada');
    expect(result.current.agencyInfo?.name).toBe('Agencia Modificada');
  });

  it('updateAgencyInfo con error lanza excepción y expone el mensaje', async () => {
    const { result } = renderHook(() => useAgencyInfo());

    mocked.updateAgencyInfo.mockRejectedValue(new Error('datos inválidos'));

    await act(async () => {
      await expect(
        result.current.updateAgencyInfo({ name: '' })
      ).rejects.toThrow('datos inválidos');
    });

    expect(result.current.error).toBe('datos inválidos');
  });

  it('fetchAgencyInfo con error expone el mensaje sin lanzar', async () => {
    const { result } = renderHook(() => useAgencyInfo());

    mocked.getAgencyInfo.mockRejectedValue(new Error('sin conexión'));

    await act(async () => {
      await result.current.fetchAgencyInfo();
    });

    expect(result.current.error).toBe('sin conexión');
    expect(result.current.agencyInfo).toBeNull();
  });
});
