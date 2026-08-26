import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('@/services/providerService', () => ({
  providerService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { providerService } from '@/services/providerService';
import { useProviders } from './useProviders';

const mocked = providerService as unknown as Record<string, ReturnType<typeof vi.fn>>;

const buildProvider = (id: number) => ({
  id,
  name: `Proveedor ${id}`,
  acronym: `P${id}`,
  email: `proveedor${id}@test.com`,
  phone: '5512345678',
  providerContactName: 'Contacto',
  active: true,
});

describe('useProviders', () => {
  beforeEach(() => {
    Object.values(mocked).forEach((fn) => fn.mockReset());
    mocked.getAll.mockResolvedValue([buildProvider(1), buildProvider(2)]);
  });

  it('carga proveedores al montar', async () => {
    const { result } = renderHook(() => useProviders());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.providers).toHaveLength(2);
    expect(result.current.error).toBeNull();
    expect(mocked.getAll).toHaveBeenCalledWith(false);
  });

  it('createProvider agrega a la lista y lo retorna', async () => {
    const { result } = renderHook(() => useProviders());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const nuevo = buildProvider(3);
    mocked.create.mockResolvedValue(nuevo);

    let creado: unknown;
    await act(async () => {
      creado = await result.current.createProvider({ name: 'Proveedor 3' } as never);
    });

    expect((creado as { id: number }).id).toBe(3);
    expect(result.current.providers).toHaveLength(3);
  });

  it('updateProvider reemplaza el proveedor en la lista', async () => {
    const { result } = renderHook(() => useProviders());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mocked.update.mockResolvedValue({ ...buildProvider(1), name: 'Actualizado' });

    let actualizado: unknown;
    await act(async () => {
      actualizado = await result.current.updateProvider(1, { ...buildProvider(1), name: 'Actualizado' });
    });

    expect((actualizado as { name: string }).name).toBe('Actualizado');
    expect(result.current.providers.find((p) => p.id === 1)?.name).toBe('Actualizado');
  });

  it('deleteProvider elimina de la lista y retorna true', async () => {
    const { result } = renderHook(() => useProviders());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mocked.delete.mockResolvedValue(undefined);

    let ok = false;
    await act(async () => {
      ok = await result.current.deleteProvider(2);
    });

    expect(ok).toBe(true);
    expect(result.current.providers).toHaveLength(1);
    expect(result.current.providers[0].id).toBe(1);
  });

  it('deleteProvider con error retorna false y expone el mensaje', async () => {
    const { result } = renderHook(() => useProviders());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mocked.delete.mockRejectedValue(new Error('fallo de red'));

    let ok = true;
    await act(async () => {
      ok = await result.current.deleteProvider(5);
    });

    expect(ok).toBe(false);
    expect(result.current.error).toBe('fallo de red');
  });

  it('getProviderById con error retorna null y expone el mensaje', async () => {
    const { result } = renderHook(() => useProviders());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mocked.getById.mockRejectedValue(new Error('no encontrado'));

    let provider: unknown;
    await act(async () => {
      provider = await result.current.getProviderById(99);
    });

    expect(provider).toBeNull();
    expect(result.current.error).toBe('no encontrado');
  });
});
