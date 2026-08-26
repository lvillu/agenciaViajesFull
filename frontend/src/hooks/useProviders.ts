/**
 * useProviders Hook
 * Hook personalizado para gestión de proveedores
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { providerService } from '@/services/providerService';
import { Provider, CreateProviderRequest, UpdateProviderRequest } from '@/types/provider';

export const useProviders = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtiene la lista de proveedores
   */
  const fetchProviders = useCallback(async (includeInactive: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await providerService.getAll(includeInactive);
      setProviders(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene un proveedor por ID
   */
  const getProviderById = useCallback(async (id: number): Promise<Provider | null> => {
    try {
      const provider = await providerService.getById(id);
      return provider;
    } catch (err: any) {
      setError(err.message || 'Error al cargar proveedor');
      return null;
    }
  }, []);

  /**
   * Crea un nuevo proveedor
   */
  const createProvider = useCallback(async (provider: CreateProviderRequest): Promise<Provider | null> => {
    setLoading(true);
    setError(null);
    try {
      const newProvider = await providerService.create(provider);
      setProviders((prev) => [...prev, newProvider]);
      return newProvider;
    } catch (err: any) {
      setError(err.message || 'Error al crear proveedor');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualiza un proveedor existente
   */
  const updateProvider = useCallback(async (id: number, provider: UpdateProviderRequest): Promise<Provider | null> => {
    setLoading(true);
    setError(null);
    try {
      const updatedProvider = await providerService.update(id, provider);
      setProviders((prev) =>
        prev.map((p) => (p.id === id ? updatedProvider : p))
      );
      return updatedProvider;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar proveedor');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Elimina (da de baja) un proveedor
   */
  const deleteProvider = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await providerService.delete(id);
      setProviders((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al eliminar proveedor');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar proveedores al montar el componente
  useEffect(() => {
    // Convencion del proyecto: carga inicial con funcion de refresh compartida.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProviders();
  }, [fetchProviders]);

  return {
    providers,
    loading,
    error,
    fetchProviders,
    getProviderById,
    createProvider,
    updateProvider,
    deleteProvider,
  };
};
