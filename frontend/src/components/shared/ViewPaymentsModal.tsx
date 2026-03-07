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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h2">Pagos de la Reserva</Typography>
      </DialogTitle>
      <DialogContent>
        {/* Resumen de totales */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1" fontWeight="medium">
              Total de la Reserva:
            </Typography>
            <Typography variant="body1" fontWeight="bold" color="primary">
              {formatCurrency(totalAmount, isDollar)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1" fontWeight="medium">
              Total Pagado:
            </Typography>
            <Typography variant="body1" fontWeight="bold" color="success.main">
              {formatCurrency(totalPaid, isDollar)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body1" fontWeight="medium">
              Saldo Pendiente:
            </Typography>
            <Typography
              variant="body1"
              fontWeight="bold"
              color={balance > 0 ? 'error.main' : 'success.main'}
            >
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
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha de Pago</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  {isDollar && (
                    <>
                      <TableCell align="right">Tipo de Cambio</TableCell>
                      <TableCell align="right">Valor en MXN</TableCell>
                    </>
                  )}
                  <TableCell>Notas</TableCell>
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
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
