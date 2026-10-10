/**
 * usePayments Hook
 * Manejo de estado y operaciones para pagos de ventas
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { paymentService } from '@/services/paymentService';
import { Payment } from '@/types/payment';

export const usePayments = (saleId: number | null) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    if (!saleId) {
      setPayments([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await paymentService.getBySale(saleId);
      setPayments(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar pagos');
    } finally {
      setLoading(false);
    }
  }, [saleId]);

  const deletePayment = async (id: number): Promise<boolean> => {
    try {
      await paymentService.delete(id);
      setPayments((prev) => prev.filter((payment) => payment.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al eliminar pago');
      return false;
    }
  };

  const getTotalPaid = useCallback((): number => {
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  }, [payments]);

  useEffect(() => {
    // Carga inicial al montar con la funcion de refresh compartida (convencion del
    // proyecto); el setLoading sincrono es intencional y no se ejecuta durante el render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    loading,
    error,
    fetchPayments,
    deletePayment,
    getTotalPaid,
  };
};
