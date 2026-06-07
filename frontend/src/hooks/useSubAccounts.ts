/**
 * useSubAccounts Hook
 * Hook personalizado para gestión de subcuentas
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { userService } from '@/services/userService';
import { SubAccount, CreateSubAccountRequest, UpdateSubAccountRequest } from '@/types/subAccount';

export const useSubAccounts = () => {
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtiene la lista de subcuentas
   */
  const fetchSubAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getSubAccounts();
      setSubAccounts(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar subcuentas');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crea una nueva subcuenta
   */
  const createSubAccount = useCallback(async (data: CreateSubAccountRequest): Promise<SubAccount | null> => {
    setLoading(true);
    setError(null);
    try {
      const newSubAccount = await userService.createSubAccount(data);
      setSubAccounts((prev) => [...prev, newSubAccount]);
      return newSubAccount;
    } catch (err: any) {
      setError(err.message || 'Error al crear subcuenta');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualiza una subcuenta
   */
  const updateSubAccount = useCallback(async (id: number, data: UpdateSubAccountRequest): Promise<SubAccount | null> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await userService.updateSubAccount(id, data);
      setSubAccounts((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar subcuenta');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Elimina una subcuenta
   */
  const deleteSubAccount = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await userService.deleteSubAccount(id);
      setSubAccounts((prev) => prev.filter((s) => s.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al eliminar subcuenta');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubAccounts();
  }, [fetchSubAccounts]);

  return {
    subAccounts,
    loading,
    error,
    fetchSubAccounts,
    createSubAccount,
    updateSubAccount,
    deleteSubAccount,
  };
};
