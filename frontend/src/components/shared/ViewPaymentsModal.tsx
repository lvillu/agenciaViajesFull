/**
 * ViewPaymentsModal
 * Modal para visualizar los pagos de una venta
 */

'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Button } from '@/components/ui/Button';
import { Payment } from '@/types/payment';

interface ViewPaymentsModalProps {
  open: boolean;
  onClose: () => void;
  payments: Payment[];
  loading?: boolean;
  error?: string | null;
  isDollar: boolean;
  totalAmount: number;
}

export const ViewPaymentsModal: React.FC<ViewPaymentsModalProps> = ({
  open,
  onClose,
  payments,
  loading = false,
  error = null,
  isDollar,
  totalAmount,
}) => {
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const balance = totalAmount - totalPaid;

  const formatCurrency = (amount: number, isDollar: boolean) => {
    return isDollar
      ? `$${amount.toFixed(2)} USD`
      : `$${amount.toFixed(2)} MXN`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 2.5,
          fontWeight: 800,
          fontSize: '1.1rem',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        Pagos de la Reserva
      </DialogTitle>
      <DialogContent sx={{ px: 3, py: 3 }}>
        {/* Resumen de totales */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Box
            sx={{
              flex: 1,
              minWidth: 140,
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Reserva
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 800, color: 'text.primary' }}>
              {formatCurrency(totalAmount, isDollar)}
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              minWidth: 140,
              p: 2,
              borderRadius: 2,
              border: '1px solid #bbf7d0',
              bgcolor: '#f0fdf4',
            }}
          >
            <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Pagado
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 800, color: '#15803d' }}>
              {formatCurrency(totalPaid, isDollar)}
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              minWidth: 140,
              p: 2,
              borderRadius: 2,
              border: `1px solid ${balance > 0 ? '#fecaca' : '#bbf7d0'}`,
              bgcolor: balance > 0 ? '#fef2f2' : '#f0fdf4',
            }}
          >
            <Typography variant="caption" sx={{ color: balance > 0 ? '#991b1b' : '#15803d', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Saldo Pendiente
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 800, color: balance > 0 ? '#991b1b' : '#15803d' }}>
              {formatCurrency(balance, isDollar)}
            </Typography>
          </Box>
        </Box>

        {/* Mensajes de estado */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Tabla de pagos */}
        {!loading && !error && payments.length === 0 && (
          <Alert severity="info">No hay pagos registrados para esta venta</Alert>
        )}

        {!loading && !error && payments.length > 0 && (
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Fecha de Pago</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Monto</TableCell>
                  {isDollar && (
                    <>
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Tipo de Cambio</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Valor en MXN</TableCell>
                    </>
                  )}
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Notas</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="medium">
                        {formatCurrency(payment.amount, isDollar)}
                      </Typography>
                    </TableCell>
                    {isDollar && (
                      <>
                        <TableCell align="right">
                          {payment.exchangeRate
                            ? `$${payment.exchangeRate.toFixed(2)}`
                            : '-'}
                        </TableCell>
                        <TableCell align="right">
                          {payment.amountMXN
                            ? `$${payment.amountMXN.toFixed(2)} MXN`
                            : '-'}
                        </TableCell>
                      </>
                    )}
                    <TableCell>
                      {payment.notes || (
                        <Typography variant="body2" color="text.secondary">
                          Sin notas
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: '#f8fafc',
        }}
      >
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
