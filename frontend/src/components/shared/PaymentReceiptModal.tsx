/**
 * PaymentReceiptModal
 * Comprobante de pago para imprimir/descargar en PDF
 */

'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Button } from '@/components/ui/Button';
import { Payment } from '@/types/payment';
import { Sale } from '@/types/sale';
import { AgencyInfo } from '@/types/agencyInfo';
import { agencyInfoService } from '@/services/agencyInfoService';
import { formatCurrency } from '@/lib/formatCurrency';

interface PaymentReceiptModalProps {
  open: boolean;
  onClose: () => void;
  payment: Payment;
  sale: Sale;
}

const PAYMENT_TYPE_LABEL: Record<number, string> = {
  1: 'ANTICIPO',
  2: 'ABONADO',
  3: 'LIQUIDACIÓN',
};

const formatDate = (dateString: string) => {
  if (!dateString) return '—';
  // Only append time if it's a plain date (YYYY-MM-DD) to avoid timezone shifts.
  // If the string already contains a time component, use it as-is.
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
    ? dateString + 'T12:00:00'
    : dateString;
  const date = new Date(normalized);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatFolio = (n: number) => String(n).padStart(4, '0');

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  open,
  onClose,
  payment,
  sale,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [agencyInfo, setAgencyInfo] = useState<AgencyInfo | null>(null);
  const [loadingAgency, setLoadingAgency] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingAgency(true);
    agencyInfoService
      .getAgencyInfo()
      .then(setAgencyInfo)
      .catch(() => setAgencyInfo(null))
      .finally(() => setLoadingAgency(false));
  }, [open]);

  const handleDownloadPdf = async () => {
    if (!receiptRef.current) return;
    setDownloadingPdf(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const options = {
        margin: [8, 8, 8, 8] as [number, number, number, number],
        filename: `comprobante-${formatFolio(payment.folioNumber)}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      };
      await html2pdf().set(options).from(receiptRef.current).save();
    } finally {
      setDownloadingPdf(false);
    }
  };

  const isDollar = sale.isDollar;
  const currency = isDollar ? 'USD' : 'MXN';
  const amount = payment.amount;
  const totalPaid = sale.totalPaid ?? 0;
  const balance = sale.remainingBalance ?? sale.totalAmount - totalPaid;
  const transactionFee = payment.transactionFee ?? 0;
  const paymentTypeLabel = PAYMENT_TYPE_LABEL[payment.paymentType] ?? 'PAGO';

  return (
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
            border: '1px solid #D8DAEA',
            overflow: 'hidden',
          },
        },
      }}
    >
      {/* Modal Header */}
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
              receipt_long
            </span>
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.125rem', color: '#525252' }}>
            Comprobante de Pago
          </Typography>
        </Box>
      </Box>

      <DialogContent sx={{ px: 3, py: 3 }}>
        {loadingAgency ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: 'primary.main' }} />
          </Box>
        ) : (
          /* ─── RECEIPT AREA (printed/PDF) ─── */
          <Box
            ref={receiptRef}
            sx={{
              bgcolor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #D8DAEA',
              overflow: 'hidden',
              fontFamily: '"Inter", "Roboto", sans-serif',
            }}
          >
            {/* Receipt Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #3D7A82 0%, #5BA9B3 100%)',
                px: 3,
                py: 2.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <Box>
                <Typography
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    mb: 0.25,
                  }}
                >
                  Comprobante de Pago
                </Typography>
                <Typography
                  sx={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}
                >
                  N° {formatFolio(payment.folioNumber)}
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'right' }}>
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '999px',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    mb: 1,
                  }}
                >
                  <Typography
                    sx={{
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {paymentTypeLabel}
                  </Typography>
                </Box>
                <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', fontWeight: 500 }}>
                  {formatDate(payment.paymentDate)}
                </Typography>
              </Box>
            </Box>

            {/* Client + Reservation Info */}
            <Box
              sx={{
                display: 'flex',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              {/* Client */}
              <Box
                sx={{
                  flex: 1,
                  px: 3,
                  py: 2,
                  borderRight: '1px solid #f1f5f9',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#94a3b8',
                    mb: 0.5,
                  }}
                >
                  Cliente
                </Typography>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                  {payment.clientName ?? sale.clientName ?? '—'}
                </Typography>
              </Box>

              {/* Reservation */}
              <Box sx={{ flex: 1, px: 3, py: 2 }}>
                <Typography
                  sx={{
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#94a3b8',
                    mb: 0.5,
                  }}
                >
                  No. Reserva
                </Typography>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                  {payment.saleReservationNumber ?? sale.reservationNumber ?? '—'}
                </Typography>
              </Box>
            </Box>

            {/* Description */}
            {sale.description && (
              <Box sx={{ px: 3, py: 1.5, borderBottom: '1px solid #f1f5f9', bgcolor: '#fafafa' }}>
                <Typography
                  sx={{
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#94a3b8',
                    mb: 0.25,
                  }}
                >
                  Descripción del Servicio
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                  {sale.description}
                </Typography>
              </Box>
            )}

            {/* Financial Strip */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                borderTop: '1px solid #D8DAEA',
                borderBottom: '1px solid #D8DAEA',
                bgcolor: 'rgba(189, 191, 220, 0.08)',
              }}
            >
              {/* Total Reserva */}
              <Box sx={{ p: 2, borderRight: '1px solid #e1bfb3' }}>
                <Typography
                  sx={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#8B8DA8',
                    mb: 0.5,
                    display: 'block',
                  }}
                >
                  TOTAL RESERVA
                </Typography>
                <Typography
                  sx={{ fontSize: '1.3rem', fontWeight: 600, color: '#525252', lineHeight: '2rem', letterSpacing: '0.01em' }}
                >
                  {formatCurrency(sale.totalAmount, currency)}
                </Typography>
              </Box>

              {/* Pagado */}
              <Box sx={{ p: 2, borderRight: '1px solid #D8DAEA', bgcolor: 'rgba(91,169,179,0.06)' }}>
                <Typography
                  sx={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#3D7A82',
                    mb: 0.5,
                    display: 'block',
                  }}
                >
                  PAGADO ({paymentTypeLabel})
                </Typography>
                <Typography
                  sx={{ fontSize: '1.3rem', fontWeight: 600, color: '#3D7A82', lineHeight: '2rem', letterSpacing: '0.01em' }}
                >
                  {formatCurrency(totalPaid, currency)}
                </Typography>
              </Box>

              {/* Saldo Pendiente */}
              <Box sx={{ p: 2 }}>
                <Typography
                  sx={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#594138',
                    mb: 0.5,
                    display: 'block',
                  }}
                >
                  SALDO PENDIENTE
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.3rem',
                    fontWeight: 600,
                    color: balance > 0 ? '#ba1a1a' : '#15803d',
                    lineHeight: '2rem',
                    letterSpacing: '0.01em',
                  }}
                >
                  {formatCurrency(Math.max(0, balance), currency)}
                </Typography>
              </Box>
            </Box>

            {/* Breakdown Table */}
            <Box sx={{ borderTop: '1px solid #f1f5f9' }}>
              {/* Header row */}
              <Box
                sx={{
                  display: 'flex',
                  px: 3,
                  py: 1.25,
                  bgcolor: 'rgba(189, 191, 220, 0.15)',
                  borderBottom: '1px solid #D8DAEA',
                }}
              >
                <Typography
                  sx={{
                    flex: 1,
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#8B8DA8',
                  }}
                >
                  Concepto
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#8B8DA8',
                    textAlign: 'right',
                    minWidth: 110,
                  }}
                >
                  Importe
                </Typography>
              </Box>



              {/* Transaction Fee (conditional) */}
              {transactionFee > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 3,
                    py: 1.5,
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <Typography sx={{ flex: 1, fontSize: '0.85rem', color: '#525252' }}>
                    Comisión por Transferencia
                  </Typography>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#525252', minWidth: 110, textAlign: 'right' }}>
                    {formatCurrency(transactionFee, currency)}
                  </Typography>
                </Box>
              )}

              {/* Total */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 3,
                  py: 2,
                  bgcolor: 'rgba(189, 191, 220, 0.12)',
                }}
              >
                <Typography sx={{ flex: 1, fontSize: '0.9rem', fontWeight: 700, color: '#525252' }}>
                  Abono
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: '#5BA9B3',
                    minWidth: 110,
                    textAlign: 'right',
                  }}
                >
                  {formatCurrency(amount + transactionFee, currency)}
                </Typography>
              </Box>
            </Box>

            {/* Notes */}
            {payment.notes && (
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  borderTop: '1px solid #D8DAEA',
                  bgcolor: 'rgba(189, 191, 220, 0.05)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#94a3b8',
                    mb: 0.5,
                  }}
                >
                  Notas
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                  {payment.notes}
                </Typography>
              </Box>
            )}

            {/* Footer */}
            <Box
              sx={{
                px: 3,
                py: 2,
                borderTop: '1px solid #D8DAEA',
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Este documento es un comprobante de pago oficial.
                {sale.finalPaymentDueDate && (
                  <> Fecha límite de liquidación: <strong>{formatDate(sale.finalPaymentDueDate)}</strong>.</>
                )}
              </Typography>
            </Box>

            {/* Agency Card */}
            {agencyInfo && (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 2,
                  mx: 3,
                  mb: 3,
                  mt: 2,
                }}
              >
                {/* Agency Info */}
                <Box
                  sx={{
                    p: 3,
                    bgcolor: 'rgba(189, 191, 220, 0.08)',
                    border: '1px solid #D8DAEA',
                    borderRadius: '8px',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    color: '#8B8DA8',
                      mb: 1.5,
                    }}
                  >
                    AGENCIA DE VIAJES EN LÍNEA
                  </Typography>
                  <Box sx={{ fontSize: '0.85rem', lineHeight: 1.7 }}>
                    <Typography sx={{ fontWeight: 700, color: '#191c1e', fontSize: '0.85rem' }}>
                      {agencyInfo.name?.toUpperCase()}
                    </Typography>
                    {agencyInfo.address && (
                      <Typography sx={{ color: '#191c1e', fontSize: '0.85rem' }}>
                        {agencyInfo.address}
                        {agencyInfo.city ? `, ${agencyInfo.city}` : ''}
                        {agencyInfo.state ? `, ${agencyInfo.state}` : ''}
                      </Typography>
                    )}
                    {agencyInfo.zipCode && (
                      <Typography sx={{ color: '#191c1e', fontSize: '0.85rem' }}>
                        C. P. {agencyInfo.zipCode}
                      </Typography>
                    )}
                    {agencyInfo.secturReg && (
                      <Typography sx={{ color: '#191c1e', fontSize: '0.85rem' }}>
                        Reg. SECTUR {agencyInfo.secturReg}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Logo */}
                <Box
                  sx={{
                    p: 3,
                    bgcolor: 'rgba(189, 191, 220, 0.08)',
                    border: '1px solid #D8DAEA',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 120,
                  }}
                >
                  <Box
                    component="img"
                    src="/IbarraTravel_logo.png"
                    alt="Ibarra Travel"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: 100,
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>
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
        <Button onClick={onClose} variant="outlined" disabled={downloadingPdf}>
          Cerrar
        </Button>
        <Button
          onClick={handleDownloadPdf}
          variant="contained"
          color="primary"
          disabled={downloadingPdf || loadingAgency}
          startIcon={
            downloadingPdf ? undefined : (
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                download
              </span>
            )
          }
        >
          {downloadingPdf ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Descargar PDF'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
