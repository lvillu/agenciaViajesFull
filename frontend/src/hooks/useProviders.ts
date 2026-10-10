/**
 * useProviders Hook
 * Hook personalizado para gestión de proveedores (listado paginado, Fase 3)
 */

'use client';

import { useState, useEffect } from 'react';
import { providerService } from '@/services/providerService';
import { Provider, CreateProviderRequest, UpdateProviderRequest } from '@/types/provider';

export const useProviders = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [page, setPageState] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtiene la página actual de proveedores
   */
  const fetchProviders = async (includeInactive: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await providerService.getAll(includeInactive, { page });
      setProviders(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      if (data.items.length === 0 && data.page > 1) {
        setPageState(data.page - 1);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  const setPage = (p: number) => {
    setPageState(Math.max(1, p));
  };

  /**
   * Obtiene un proveedor por ID
   */
  const getProviderById = async (id: number): Promise<Provider | null> => {
    try {
      const provider = await providerService.getById(id);
      return provider;
    } catch (err: any) {
      setError(err.message || 'Error al cargar proveedor');
      return null;
    }
  };

  /**
   * Crea un nuevo proveedor y recarga la página actual
   */
  const createProvider = async (provider: CreateProviderRequest): Promise<Provider | null> => {
    setLoading(true);
    setError(null);
    try {
      const newProvider = await providerService.create(provider);
      await fetchProviders();
      return newProvider;
    } catch (err: any) {
      setError(err.message || 'Error al crear proveedor');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualiza un proveedor existente
   */
  const updateProvider = async (id: number, provider: UpdateProviderRequest): Promise<Provider | null> => {
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
  };

  /**
   * Elimina (da de baja) un proveedor y recarga la página actual
   */
  const deleteProvider = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await providerService.delete(id);
      await fetchProviders();
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al eliminar proveedor');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial y refetch al cambiar de página
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchProviders();
  }, [page]);

  return {
    providers,
    page,
    setPage,
    totalPages,
    total,
    loading,
    error,
    fetchProviders,
    getProviderById,
    createProvider,
    updateProvider,
    deleteProvider,
  };
};
