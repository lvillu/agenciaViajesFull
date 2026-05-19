/**
 * AddPaymentModal
 * Modal para agregar un pago a una venta
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DateInput } from '@/components/ui/DateInput';
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
      transactionFee: undefined,
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
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '12px',
            bgcolor: '#f8f6f6',
            border: '1px solid #e2e8f0',
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <span
            className="material-symbols-outlined"
            style={{ color: '#ec5b13', fontSize: '24px', lineHeight: 1 }}
          >
            payments
          </span>
          <Typography sx={{ fontWeight: 700, fontSize: '1.125rem', color: '#0f172a' }}>
            Registrar Pago
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            color: '#64748b',
            '&:hover': { bgcolor: '#f1f5f9' },
            borderRadius: '50%',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>close</span>
        </IconButton>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ px: 3, py: 3 }}>
          {/* Resumen financiero */}
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#0f172a',
              mb: 2,
            }}
          >
            Resumen Financiero
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
            <Box
              sx={{
                flex: 1,
                minWidth: 120,
                p: 2,
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
              }}
            >
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b', mb: 0.5 }}>
                Total Reserva
              </Typography>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                {formatCurrency(totalAmount, isDollar)}
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                minWidth: 120,
                p: 2,
                borderRadius: '8px',
                border: '1px solid #bbf7d0',
                bgcolor: 'rgba(240, 253, 244, 0.5)',
              }}
            >
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: '#15803d', mb: 0.5 }}>
                Total Pagado
              </Typography>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#16a34a' }}>
                {formatCurrency(totalPaid, isDollar)}
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                minWidth: 120,
                p: 2,
                borderRadius: '8px',
                border: '1px solid #fecaca',
                bgcolor: 'rgba(254, 242, 242, 0.5)',
              }}
            >
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: '#b91c1c', mb: 0.5 }}>
                Saldo Actual
              </Typography>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#dc2626' }}>
                {formatCurrency(totalAmount - totalPaid, isDollar)}
              </Typography>
            </Box>
          </Box>

          {amount > 0 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                mb: 3,
                borderRadius: '8px',
                border: `1px solid ${remainingBalance > 0 ? '#fecaca' : '#bbf7d0'}`,
                bgcolor: remainingBalance > 0 ? 'rgba(254,242,242,0.6)' : 'rgba(240,253,244,0.6)',
              }}
            >
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                Saldo después del pago:
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  color: remainingBalance > 0 ? '#dc2626' : '#16a34a',
                }}
              >
                {formatCurrency(Math.max(0, remainingBalance), isDollar)}
              </Typography>
            </Box>
          )}

          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          {/* Detalles del pago */}
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#0f172a',
              mb: 2,
            }}
          >
            Detalles del Nuevo Pago
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 180 }}>
              <Controller
                name="paymentDate"
                control={control}
                render={({ field }) => (
                  <DateInput
                    label="Fecha de Pago"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={!!errors.paymentDate}
                    helperText={errors.paymentDate?.message}
                    required
                  />
                )}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 180 }}>
              <Input
                label={`Monto del Pago ${isDollar ? '(USD)' : '(MXN)'}`}
                type="number"
                placeholder="0.00"
                inputProps={{ step: '0.01', min: '0' }}
                InputProps={{
                  startAdornment: (
                    <span
                      className="material-symbols-outlined"
                      style={{ color: '#94a3b8', fontSize: '20px', marginRight: '6px', lineHeight: 1 }}
                    >
                      attach_money
                    </span>
                  ),
                }}
                {...register('amount', { valueAsNumber: true })}
                error={!!errors.amount}
                helperText={errors.amount?.message}
              />
            </Box>
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

          <Box sx={{ mb: 1 }}>
            <Input
              label="Comisión por Transferencia (opcional)"
              type="number"
              placeholder="0.00"
              inputProps={{ step: '0.01', min: '0' }}
              InputProps={{
                startAdornment: (
                  <span
                    className="material-symbols-outlined"
                    style={{ color: '#94a3b8', fontSize: '20px', marginRight: '6px', lineHeight: 1 }}
                  >
                    percent
                  </span>
                ),
              }}
              {...register('transactionFee', {
                setValueAs: (value) => (value === '' ? undefined : Number(value)),
              })}
              error={!!errors.transactionFee}
              helperText={errors.transactionFee?.message || 'Cargo adicional por comisión bancaria'}
            />
          </Box>

          <Box sx={{ mb: 1 }}>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Notas o Referencia"
                  multiline
                  rows={3}
                  placeholder="Ej. Transferencia bancaria, pago en efectivo..."
                  error={!!errors.notes}
                  helperText={errors.notes?.message}
                />
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2.5,
            gap: 1.5,
            borderTop: '1px solid #e2e8f0',
            bgcolor: '#f8fafc',
            justifyContent: 'flex-end',
          }}
        >
          <Button onClick={handleClose} variant="outlined" disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={
              loading ? undefined : (
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  check_circle
                </span>
              )
            }
          >
            {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Registrar Pago'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
