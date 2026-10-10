/**
 * usePayments Hook
 * Manejo de estado y operaciones para pagos de ventas (listado paginado, Fase 3)
 */

'use client';

import { useState, useEffect } from 'react';
import { paymentService } from '@/services/paymentService';
import { Payment } from '@/types/payment';

export const usePayments = (saleId: number | null) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [page, setPageState] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    if (!saleId) {
      setPayments([]);
      setTotal(0);
      setTotalPages(1);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await paymentService.getBySale(saleId, { page });
      setPayments(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      if (data.items.length === 0 && data.page > 1) {
        setPageState(data.page - 1);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar pagos');
    } finally {
      setLoading(false);
    }
  };

  const setPage = (p: number) => {
    setPageState(Math.max(1, p));
  };

  const deletePayment = async (id: number): Promise<boolean> => {
    try {
      await paymentService.delete(id);
      await fetchPayments();
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al eliminar pago');
      return false;
    }
  };

  const getTotalPaid = (): number => {
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  useEffect(() => {
    // Carga inicial al montar con la funcion de refresh compartida (convencion del
    // proyecto); el setLoading sincrono es intencional y no se ejecuta durante el render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchPayments();
  }, [page, saleId]);

  return {
    payments,
    page,
    setPage,
    totalPages,
    total,
    loading,
    error,
    fetchPayments,
    deletePayment,
    getTotalPaid,
  };
};
