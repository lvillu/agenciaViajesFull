/**
 * useClients Hook
 * Hook personalizado para gestión de clientes
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { clientService } from '@/services/clientService';
import { Client, CreateClientRequest, UpdateClientRequest } from '@/types/client';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtiene la lista de clientes
   */
  const fetchClients = useCallback(async (includeInactive: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientService.getAll(includeInactive);
      setClients(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene un cliente por ID
   */
  const getClientById = useCallback(async (id: number): Promise<Client | null> => {
    try {
      const client = await clientService.getById(id);
      return client;
    } catch (err: any) {
      setError(err.message || 'Error al cargar cliente');
      return null;
    }
  }, []);

  /**
   * Crea un nuevo cliente
   */
  const createClient = useCallback(async (client: CreateClientRequest): Promise<Client> => {
    setLoading(true);
    try {
      const newClient = await clientService.create(client);
      setClients((prev) => [...prev, newClient]);
      return newClient;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualiza un cliente existente
   */
  const updateClient = useCallback(async (id: number, client: UpdateClientRequest): Promise<Client> => {
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
  }, []);

  /**
   * Elimina (da de baja) un cliente
   */
  const deleteClient = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await clientService.delete(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al eliminar cliente');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    error,
    fetchClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
  };
};
