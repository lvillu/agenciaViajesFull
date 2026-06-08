/**
 * ViewPaymentsModal
 * Modal para visualizar los pagos de una venta
 */

'use client';

import React, { useState } from 'react';
import {
  Dialog,
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
  IconButton,
  Tooltip,
} from '@mui/material';
import { Button } from '@/components/ui/Button';
import { Payment } from '@/types/payment';
import { Sale } from '@/types/sale';
import { formatCurrency } from '@/lib/formatCurrency';
import { PaymentReceiptModal } from './PaymentReceiptModal';

interface ViewPaymentsModalProps {
  open: boolean;
  onClose: () => void;
  payments: Payment[];
  loading?: boolean;
  error?: string | null;
  isDollar: boolean;
  totalAmount: number;
  sale: Sale;
}

export const ViewPaymentsModal: React.FC<ViewPaymentsModalProps> = ({
  open,
  onClose,
  payments,
  loading = false,
  error = null,
  isDollar,
  totalAmount,
  sale,
}) => {
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const balance = totalAmount - totalPaid;
  const paidPercent = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;
  const pendingPercent = 100 - paidPercent;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('es-MX', { month: 'long' });
    const year = date.getFullYear();
    // Capitalizar primera letra del mes (ej: "noviembre" → "Noviembre")
    const monthCapitalized = month.charAt(0).toUpperCase() + month.slice(1);
    return `${day} de ${monthCapitalized} de ${year}`;
  };

  return (
    <>
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '12px',
            bgcolor: 'background.paper',
            overflow: 'hidden',
            border: '1px solid #D8DAEA',
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
          borderBottom: '1px solid #D8DAEA',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              p: 1,
              bgcolor: 'rgba(91, 169, 179, 0.1)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              color: '#5BA9B3',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px', lineHeight: 1 }}>
              payments
            </span>
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.125rem', color: '#525252' }}>
            Pagos de la Reserva
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: '#8B8DA8', '&:hover': { bgcolor: 'rgba(189, 191, 220, 0.2)' }, borderRadius: '50%' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>close</span>
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 3, py: 3 }}>
        {/* Información de la reserva */}
        {(sale.reservationNumber || sale.description) && (
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mb: 3,
              p: 2,
              borderRadius: '12px',
              border: '1px solid #D8DAEA',
              bgcolor: '#ffffff',
              flexWrap: 'wrap',
            }}
          >
            {sale.reservationNumber && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#5BA9B3', lineHeight: 1 }}>
                  key
                </span>
                <Box>
                  <Typography
                    sx={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: '#8B8DA8',
                      lineHeight: 1.2,
                    }}
                  >
                    Clave de Reserva
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#525252' }}>
                    {sale.reservationNumber}
                  </Typography>
                </Box>
              </Box>
            )}
            {sale.reservationNumber && sale.description && (
              <Box sx={{ width: '1px', bgcolor: '#D8DAEA', alignSelf: 'stretch' }} />
            )}
            {sale.description && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#8B8DA8', lineHeight: 1 }}>
                  description
                </span>
                <Box>
                  <Typography
                    sx={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: '#8B8DA8',
                      lineHeight: 1.2,
                    }}
                  >
                    Descripción
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: '#525252', whiteSpace: 'pre-line' }}>
                    {sale.description}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Tarjetas de resumen */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 4, flexWrap: 'wrap' }}>
          {/* Total Reserva */}
          <Box
            sx={{
              flex: 1,
              minWidth: 150,
              p: 2.5,
              borderRadius: '12px',
              border: '1px solid #D8DAEA',
              bgcolor: '#ffffff',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#8B8DA8',
                mb: 0.5,
              }}
            >
              Total Reserva
            </Typography>
            <Typography sx={{ fontSize: '1.4rem', fontWeight: 700, color: '#525252', lineHeight: 1.2 }}>
              {formatCurrency(totalAmount, isDollar)}
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#ADB0C8', mt: 1 }}>
              Base de reserva
            </Typography>
          </Box>

          {/* Total Pagado */}
          <Box
            sx={{
              flex: 1,
              minWidth: 150,
              p: 2.5,
              borderRadius: '12px',
              border: '1px solid rgba(91, 169, 179, 0.3)',
              bgcolor: 'rgba(91, 169, 179, 0.06)',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#3D7A82',
                mb: 0.5,
              }}
            >
              Total Pagado
            </Typography>
            <Typography sx={{ fontSize: '1.4rem', fontWeight: 700, color: '#5BA9B3', lineHeight: 1.2 }}>
              {formatCurrency(totalPaid, isDollar)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#5BA9B3', lineHeight: 1 }}>
                trending_up
              </span>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#5BA9B3' }}>
                {paidPercent}% Completado
              </Typography>
            </Box>
          </Box>

          {/* Saldo Pendiente */}
          <Box
            sx={{
              flex: 1,
              minWidth: 150,
              p: 2.5,
              borderRadius: '12px',
              border: `1px solid ${balance > 0 ? '#fecaca' : '#a7f3d0'}`,
              bgcolor: balance > 0 ? 'rgba(254,242,242,0.5)' : 'rgba(240,253,244,0.5)',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: balance > 0 ? '#b91c1c' : '#047857',
                mb: 0.5,
              }}
            >
              Saldo Pendiente
            </Typography>
            <Typography
              sx={{
                fontSize: '1.4rem',
                fontWeight: 700,
                color: balance > 0 ? '#dc2626' : '#16a34a',
                lineHeight: 1.2,
              }}
            >
              {formatCurrency(balance, isDollar)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '14px', color: balance > 0 ? '#dc2626' : '#16a34a', lineHeight: 1 }}
              >
                {balance > 0 ? 'pending_actions' : 'check_circle'}
              </span>
              <Typography
                sx={{ fontSize: '0.7rem', fontWeight: 700, color: balance > 0 ? '#dc2626' : '#16a34a' }}
              >
                {balance > 0 ? `${pendingPercent}% Restante` : 'Liquidado'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Título de historial + badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#525252' }}>
            Historial de Pagos
          </Typography>
          {!loading && !error && (
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                bgcolor: 'rgba(189, 191, 220, 0.2)',
                borderRadius: '999px',
              }}
            >
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#8B8DA8' }}>
                {payments.length} {payments.length === 1 ? 'Movimiento' : 'Movimientos'}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Estado de carga */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: 'primary.main' }} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && payments.length === 0 && (
          <Alert severity="info">No hay pagos registrados para esta venta</Alert>
        )}

        {!loading && !error && payments.length > 0 && (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ border: '1px solid #D8DAEA', borderRadius: '12px', overflowX: 'auto' }}
          >
            <Table sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(189, 191, 220, 0.15)' }}>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      color: '#8B8DA8',
                      borderBottom: '1px solid #D8DAEA',
                      py: 2,
                    }}
                  >
                    Fecha de Pago
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      color: '#8B8DA8',
                      borderBottom: '1px solid #D8DAEA',
                      py: 2,
                    }}
                  >
                    Monto
                  </TableCell>
                  {isDollar && (
                    <>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.07em',
                          color: '#475569',
                          borderBottom: '1px solid #e2e8f0',
                          py: 2,
                        }}
                      >
                        Tipo de Cambio
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.07em',
                          color: '#475569',
                          borderBottom: '1px solid #e2e8f0',
                          py: 2,
                        }}
                      >
                        Valor en MXN
                      </TableCell>
                    </>
                  )}
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      color: '#8B8DA8',
                      borderBottom: '1px solid #D8DAEA',
                      py: 2,
                    }}
                  >
                    Notas
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      color: '#8B8DA8',
                      borderBottom: '1px solid #D8DAEA',
                      py: 2,
                      textAlign: 'center',
                    }}
                  >
                    Comprobante
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    sx={{ '&:hover': { bgcolor: 'rgba(189, 191, 220, 0.1)' }, '&:last-child td': { border: 0 } }}
                  >
                    <TableCell sx={{ py: 2.5, borderBottom: '1px solid #f1f5f9' }}>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#525252' }}>
                        {formatDate(payment.paymentDate)}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: '#ADB0C8', mt: 0.25 }}>
                        ID: PAY-{payment.id}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2.5, borderBottom: '1px solid #f1f5f9' }}>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#5BA9B3' }}>
                        {formatCurrency(payment.amount, isDollar)}
                      </Typography>
                    </TableCell>
                    {isDollar && (
                      <>
                        <TableCell sx={{ py: 2.5, borderBottom: '1px solid #f1f5f9' }}>
                          <Typography sx={{ fontSize: '0.875rem', color: '#525252' }}>
                            {payment.exchangeRate ? `$${payment.exchangeRate.toFixed(2)}` : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2.5, borderBottom: '1px solid #f1f5f9' }}>
                          <Typography sx={{ fontSize: '0.875rem', color: '#334155' }}>
                            {payment.amountMXN ? formatCurrency(payment.amountMXN, false) : '-'}
                          </Typography>
                        </TableCell>
                      </>
                    )}
                    <TableCell sx={{ py: 2.5, borderBottom: '1px solid #f1f5f9' }}>
                      <Typography
                        sx={{
                          fontSize: '0.875rem',
                          color: payment.notes ? '#8B8DA8' : '#ADB0C8',
                          maxWidth: 260,
                          lineHeight: 1.5,
                        }}
                      >
                        {payment.notes || 'Sin notas'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2.5, borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                      <Tooltip title="Ver comprobante">
                        <IconButton
                          size="small"
                          onClick={() => setReceiptPayment(payment)}
                          sx={{
                            color: '#5BA9B3',
                            '&:hover': { bgcolor: 'rgba(91,169,179,0.08)' },
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                            receipt_long
                          </span>
                        </IconButton>
                      </Tooltip>
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
          py: 2.5,
          gap: 1.5,
          borderTop: '1px solid #D8DAEA',
          bgcolor: 'rgba(189, 191, 220, 0.12)',
          justifyContent: 'flex-end',
        }}
      >
        <Button onClick={onClose} variant="contained" color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>

    {/* Receipt Modal */}
    {receiptPayment && (
      <PaymentReceiptModal
        open={!!receiptPayment}
        onClose={() => setReceiptPayment(null)}
        payment={receiptPayment}
        sale={sale}
      />
    )}
    </>
  );
};
