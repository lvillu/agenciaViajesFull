/**
 * useSales Hook
 * Manejo de estado y operaciones CRUD para ventas
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { saleService } from '@/services/saleService';
import { Sale, SaleWithTotals } from '@/types/sale';

export const useSales = (includeInactive: boolean = false) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await saleService.getAll(includeInactive);
      setSales(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  const deleteSale = async (id: number): Promise<boolean> => {
    try {
      await saleService.delete(id);
      setSales((prev) => prev.filter((sale) => sale.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al eliminar venta');
      return false;
    }
  };

  useEffect(() => {
    // Convencion del proyecto: carga inicial con funcion de refresh compartida.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSales();
  }, [fetchSales]);

  return {
    sales,
    loading,
    error,
    fetchSales,
    deleteSale,
  };
};

/**
 * useSale Hook
 * Hook para obtener una venta específica con totales
 */
export const useSale = (id: number | null) => {
  const [sale, setSale] = useState<SaleWithTotals | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSale = useCallback(async () => {
    if (!id) {
      setSale(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await saleService.getByIdWithTotals(id);
      setSale(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar venta');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // Carga de la venta al montar; refetch expuesto para recarga manual.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSale();
  }, [fetchSale]);

  return {
    sale,
    loading,
    error,
    refetch: fetchSale,
  };
};
