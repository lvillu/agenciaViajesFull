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
  const formatted = date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  // Capitalize the month name (e.g. "26 de mayo de 2026" → "26 de Mayo de 2026")
  return formatted.replace(/de ([a-záéíóúñ])/i, (_, letter) => 'de ' + letter.toUpperCase());
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
    // Spinner inmediato al abrir el modal; la carga en si es asincrona.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
  const totalPaid = sale.totalPaid ?? 0;
  const balance = sale.remainingBalance ?? sale.totalAmount - totalPaid;
  const paymentTypeLabel = PAYMENT_TYPE_LABEL[payment.paymentType] ?? 'RECIBO PAGO';

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
            {/* Receipt Header — 3 columns: Logo | Agency Info | Folio + Date */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #3D7A82 0%, #5BA9B3 100%)',
                px: 3,
                py: 2.5,
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: 3,
                alignItems: 'center',
              }}
            >
              {/* Column 1 — Logo */}
              {agencyInfo && (
                <Box
                  component="img"
                  src="/IbarraTravel_logo.png"
                  alt="Ibarra Travel"
                  sx={{
                    width: 150,
                    height: 130,
                    borderRadius: '8px',
                    objectFit: 'contain',
                    bgcolor: 'rgba(255,255,255,0.95)',
                    p: 1,
                  }}
                />
              )}

              {/* Column 2 — Agency Info (white text) */}
              {agencyInfo && (
                <Box>
                  <Typography
                    sx={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.1, mb: 1.5 }}
                  >
                    {agencyInfo.name?.toUpperCase()}
                  </Typography>
                  {agencyInfo.address && (
                    <Typography sx={{ color: '#ffffff', fontSize: '0.8rem', lineHeight: 1.5 }}>
                      {agencyInfo.address}
                      {agencyInfo.city ? `, ${agencyInfo.city}` : ''}
                      {agencyInfo.state ? `, ${agencyInfo.state}` : ''}
                    </Typography>
                  )}
                  {agencyInfo.zipCode && (
                    <Typography sx={{ color: '#ffffff', fontSize: '0.75rem', lineHeight: 1.5 }}>
                      C. P. {agencyInfo.zipCode}
                    </Typography>
                  )}
                  {agencyInfo.secturReg && (
                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', lineHeight: 1.5 }}>
                      Reg. SECTUR {agencyInfo.secturReg}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Column 3 — Date + Folio Number */}
              <Box sx={{ textAlign: 'right' }}>
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '999px',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    mb: 0.5,
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
                <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', fontWeight: 500, display: 'block' }}>
                  {formatDate(payment.paymentDate)}
                </Typography>
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
                  sx={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.1, mb: 1.5 }}
                >
                  N° {formatFolio(payment.folioNumber)}
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
                <Typography sx={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
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
                  ANTICIPO PAGADO
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
