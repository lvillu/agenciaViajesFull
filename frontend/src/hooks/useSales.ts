/**
 * useSales Hook
 * Manejo de estado y operaciones CRUD para ventas (listado paginado, Fase 3)
 */

'use client';

import { useState, useEffect } from 'react';
import { saleService } from '@/services/saleService';
import { Sale, SaleWithTotals } from '@/types/sale';

export const useSales = (includeInactive: boolean = false) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [page, setPageState] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await saleService.getAll(includeInactive, { page });
      setSales(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      if (data.items.length === 0 && data.page > 1) {
        setPageState(data.page - 1);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  };

  const setPage = (p: number) => {
    setPageState(Math.max(1, p));
  };

  const deleteSale = async (id: number): Promise<boolean> => {
    try {
      await saleService.delete(id);
      await fetchSales();
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al eliminar venta');
      return false;
    }
  };

  useEffect(() => {
    // Convencion del proyecto: carga inicial con funcion de refresh compartida.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchSales();
  }, [page, includeInactive]);

  return {
    sales,
    page,
    setPage,
    totalPages,
    total,
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

  const fetchSale = async () => {
    if (!id) {
      setSale(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await saleService.getByIdWithTotals(id);
      setSale(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar venta');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Carga de la venta al montar; refetch expuesto para recarga manual.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchSale();
  }, [id]);

  return {
    sale,
    loading,
    error,
    refetch: fetchSale,
  };
};
