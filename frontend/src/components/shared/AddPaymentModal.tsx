/**
 * AddPaymentModal
 * Modal para agregar un pago a una venta
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Alert,
  CircularProgress,
  TextField,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { paymentService } from '@/services/paymentService';
import {
  CreatePaymentSchema,
  type CreatePaymentFormData,
} from '@/types/payment';

interface AddPaymentModalProps {
  open: boolean;
  onClose: () => void;
  saleId: number;
  totalAmount: number;
  totalPaid: number;
  isDollar: boolean;
  onPaymentAdded: () => void;
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  open,
  onClose,
  saleId,
  totalAmount,
  totalPaid,
  isDollar,
  onPaymentAdded,
}) => {
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [remainingBalance, setRemainingBalance] = useState(totalAmount - totalPaid);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreatePaymentFormData>({
    resolver: zodResolver(CreatePaymentSchema),
    defaultValues: {
      saleId,
      paymentDate: new Date().toISOString().split('T')[0],
      amount: 0,
      exchangeRate: undefined,
      amountMXN: undefined,
      notes: '',
    },
  });

  // Observar cambios en amount y exchangeRate para calcular amountMXN
  const amount = watch('amount');
  const exchangeRate = watch('exchangeRate');

  useEffect(() => {
    const balance = totalAmount - totalPaid - (amount || 0);
    setRemainingBalance(balance);
  }, [amount, totalAmount, totalPaid]);

  const onSubmit = async (data: CreatePaymentFormData) => {
    setSubmitError(null);
    setLoading(true);

    try {
      // Calcular amountMXN si es en dólares y hay tipo de cambio
      let paymentData = { ...data, saleId };
      
      if (isDollar && data.exchangeRate && data.exchangeRate > 0) {
        paymentData.amountMXN = data.amount * data.exchangeRate;
      }

      await paymentService.create(paymentData);
      
      reset();
      onPaymentAdded();
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || 'Error al registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setSubmitError(null);
    onClose();
  };

  const formatCurrency = (amount: number, isDollar: boolean) => {
    return isDollar
      ? `$${amount.toFixed(2)} USD`
      : `$${amount.toFixed(2)} MXN`;
  };

  const calculatedAmountMXN = isDollar && exchangeRate && exchangeRate > 0
    ? (amount || 0) * exchangeRate
    : undefined;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h2">Agregar Pago</Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {/* Información de la venta */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" fontWeight="medium">
                Total de la Reserva:
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {formatCurrency(totalAmount, isDollar)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" fontWeight="medium">
                Total Pagado:
              </Typography>
              <Typography variant="body1" color="success.main">
                {formatCurrency(totalPaid, isDollar)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" fontWeight="medium">
                Saldo Actual:
              </Typography>
              <Typography variant="body1" color="error.main">
                {formatCurrency(totalAmount - totalPaid, isDollar)}
              </Typography>
            </Box>
            {amount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body1" fontWeight="bold">
                  Saldo Después del Pago:
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  color={remainingBalance > 0 ? 'error.main' : 'success.main'}
                >
                  {formatCurrency(Math.max(0, remainingBalance), isDollar)}
                </Typography>
              </Box>
            )}
          </Box>

          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          {/* Formulario */}
          <Box sx={{ mb: 2 }}>
            <Input
              label="Fecha de Pago"
              type="date"
              {...register('paymentDate')}
              error={!!errors.paymentDate}
              helperText={errors.paymentDate?.message}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Input
              label={`Monto del Pago ${isDollar ? '(USD)' : '(MXN)'}`}
              type="number"
              inputProps={{ step: '0.01', min: '0' }}
              {...register('amount', { valueAsNumber: true })}
              error={!!errors.amount}
              helperText={errors.amount?.message}
            />
          </Box>

          {isDollar && (
            <>
              <Box sx={{ mb: 2 }}>
                <Input
                  label="Tipo de Cambio (MXN por USD)"
                  type="number"
                  inputProps={{ step: '0.01', min: '0' }}
                  {...register('exchangeRate', { valueAsNumber: true })}
                  error={!!errors.exchangeRate}
                  helperText={errors.exchangeRate?.message || 'Opcional: Tipo de cambio del día'}
                />
              </Box>

              {calculatedAmountMXN && calculatedAmountMXN > 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Valor en pesos: <strong>${calculatedAmountMXN.toFixed(2)} MXN</strong>
                </Alert>
              )}
            </>
          )}

          <Box sx={{ mb: 2 }}>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Notas"
                  multiline
                  rows={3}
                  fullWidth
                  variant="outlined"
                  size="small"
                  error={!!errors.notes}
                  helperText={errors.notes?.message || 'Opcional: Información adicional del pago'}
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Registrar Pago'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
