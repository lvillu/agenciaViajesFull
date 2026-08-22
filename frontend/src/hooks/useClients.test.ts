import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('@/services/clientService', () => ({
  clientService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { clientService } from '@/services/clientService';
import { useClients } from './useClients';

const mocked = clientService as unknown as Record<string, ReturnType<typeof vi.fn>>;

const buildClient = (id: number) => ({
  id,
  name: `Cliente ${id}`,
  lastName: 'Pérez',
  address: 'Calle 1',
  phone: '5512345678',
  email: `cliente${id}@test.com`,
  active: true,
});

describe('useClients', () => {
  beforeEach(() => {
    Object.values(mocked).forEach((fn) => fn.mockReset());
    mocked.getAll.mockResolvedValue([buildClient(1), buildClient(2)]);
  });

  it('carga clientes al montar', async () => {
    const { result } = renderHook(() => useClients());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.clients).toHaveLength(2);
    expect(result.current.error).toBeNull();
    expect(mocked.getAll).toHaveBeenCalledWith(false);
  });

  it('fetchClients con includeInactive lo propaga al servicio', async () => {
    const { result } = renderHook(() => useClients());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.fetchClients(true);
    });

    expect(mocked.getAll).toHaveBeenLastCalledWith(true);
  });

  it('getClientById retorna el cliente', async () => {
    const { result } = renderHook(() => useClients());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mocked.getById.mockResolvedValue(buildClient(7));

    let client: unknown;
    await act(async () => {
      client = await result.current.getClientById(7);
    });

    expect(mocked.getById).toHaveBeenCalledWith(7);
    expect((client as { id: number }).id).toBe(7);
  });

  it('createClient agrega el cliente a la lista', async () => {
    const { result } = renderHook(() => useClients());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const nuevo = buildClient(3);
    mocked.create.mockResolvedValue(nuevo);

    await act(async () => {
      await result.current.createClient({ name: 'Cliente 3' } as never);
    });

    expect(result.current.clients).toHaveLength(3);
    expect(result.current.clients.some((c) => c.id === 3)).toBe(true);
  });

  it('updateClient reemplaza el cliente en la lista', async () => {
    const { result } = renderHook(() => useClients());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const actualizado = { ...buildClient(1), name: 'Modificado' };
    mocked.update.mockResolvedValue(actualizado);

    await act(async () => {
      await result.current.updateClient(1, { name: 'Modificado' });
    });

    expect(result.current.clients.find((c) => c.id === 1)?.name).toBe('Modificado');
  });

  it('deleteClient elimina de la lista y retorna true', async () => {
    const { result } = renderHook(() => useClients());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mocked.delete.mockResolvedValue(undefined);

    let ok = false;
    await act(async () => {
      ok = await result.current.deleteClient(1);
    });

    expect(ok).toBe(true);
    expect(result.current.clients).toHaveLength(1);
    expect(result.current.clients[0].id).toBe(2);
  });

  it('deleteClient con error retorna false y expone el mensaje', async () => {
    const { result } = renderHook(() => useClients());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mocked.delete.mockRejectedValue(new Error('No se pudo eliminar'));

    let ok = true;
    await act(async () => {
      ok = await result.current.deleteClient(9);
    });

    expect(ok).toBe(false);
    expect(result.current.error).toBe('No se pudo eliminar');
  });
});
