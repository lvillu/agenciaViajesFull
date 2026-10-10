/**
 * useClients Hook
 * Hook personalizado para gestión de clientes (listado paginado, Fase 3)
 */

'use client';

import { useState, useEffect } from 'react';
import { clientService } from '@/services/clientService';
import { Client, CreateClientRequest, UpdateClientRequest } from '@/types/client';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [page, setPageState] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtiene la página actual de clientes
   */
  const fetchClients = async (includeInactive: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientService.getAll(includeInactive, { page });
      setClients(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      // Si la página quedó vacía (p. ej. tras eliminar), retroceder
      if (data.items.length === 0 && data.page > 1) {
        setPageState(data.page - 1);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const setPage = (p: number) => {
    setPageState(Math.max(1, p));
  };

  /**
   * Obtiene un cliente por ID
   */
  const getClientById = async (id: number): Promise<Client | null> => {
    try {
      const client = await clientService.getById(id);
      return client;
    } catch (err: any) {
      setError(err.message || 'Error al cargar cliente');
      return null;
    }
  };

  /**
   * Crea un nuevo cliente y recarga la página actual
   */
  const createClient = async (client: CreateClientRequest): Promise<Client> => {
    setLoading(true);
    try {
      const newClient = await clientService.create(client);
      await fetchClients();
      return newClient;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualiza un cliente existente
   */
  const updateClient = async (id: number, client: UpdateClientRequest): Promise<Client> => {
    setLoading(true);
    try {
      const updatedClient = await clientService.update(id, client);
      setClients((prev) =>
        prev.map((c) => (c.id === id ? updatedClient : c))
      );
      return updatedClient;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Elimina (da de baja) un cliente y recarga la página actual
   */
  const deleteClient = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await clientService.delete(id);
      await fetchClients();
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al eliminar cliente');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Carga inicial y refetch al cambiar de página.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchClients();
  }, [page]);

  return {
    clients,
    page,
    setPage,
    totalPages,
    total,
    loading,
    error,
    fetchClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
  };
};
