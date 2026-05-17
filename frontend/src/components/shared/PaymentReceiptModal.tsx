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

interface PaymentReceiptModalProps {
  open: boolean;
  onClose: () => void;
  payment: Payment;
  sale: Sale;
}

const PAYMENT_TYPE_LABEL: Record<number, string> = {
  1: 'ANTICIPO',
  2: 'ABONO',
  3: 'LIQUIDACIÓN',
};

const PAYMENT_TYPE_COLOR: Record<number, string> = {
  1: '#a63b00',
  2: '#0369a1',
  3: '#15803d',
};

const formatCurrency = (amount: number, currency: string = 'MXN') => {
  const formatted = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `$${formatted} ${currency}`;
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
  const subTotal = amount / 1.16;
  const iva = amount - subTotal;
  const transactionFee = payment.transactionFee ?? 0;
  const paymentTypeLabel = PAYMENT_TYPE_LABEL[payment.paymentType] ?? 'PAGO';
  const paymentTypeColor = PAYMENT_TYPE_COLOR[payment.paymentType] ?? '#a63b00';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          bgcolor: '#f7f9fb',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
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
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              p: 1,
              bgcolor: 'rgba(236, 91, 19, 0.1)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              color: '#ec5b13',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px', lineHeight: 1 }}>
              receipt_long
            </span>
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.125rem', color: '#0f172a' }}>
            Comprobante de Pago
          </Typography>
        </Box>
      </Box>

      <DialogContent sx={{ px: 3, py: 3 }}>
        {loadingAgency ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#ec5b13' }} />
          </Box>
        ) : (
          /* ─── RECEIPT AREA (printed/PDF) ─── */
          <Box
            ref={receiptRef}
            sx={{
              bgcolor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              fontFamily: '"Inter", "Roboto", sans-serif',
            }}
          >
            {/* Receipt Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #a63b00 0%, #f26522 100%)',
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
            <Box sx={{ display: 'flex' }}>
              {/* Total Reserva */}
              <Box
                sx={{
                  flex: 1,
                  px: 2.5,
                  py: 2,
                  borderRight: '1px solid #f1f5f9',
                  textAlign: 'center',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#94a3b8',
                    mb: 0.5,
                  }}
                >
                  Total Reserva
                </Typography>
                <Typography
                  sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}
                >
                  {formatCurrency(sale.totalAmount, currency)}
                </Typography>
              </Box>

              {/* Este Pago — highlighted */}
              <Box
                sx={{
                  flex: 1,
                  px: 2.5,
                  py: 2,
                  borderRight: '1px solid #f1f5f9',
                  textAlign: 'center',
                  bgcolor: 'rgba(166,59,0,0.04)',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    backgroundColor: paymentTypeColor,
                    borderRadius: '4px',
                    marginBottom: '6px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: '#ffffff',
                      WebkitTextFillColor: '#ffffff',
                      lineHeight: '1.2',
                    }}
                  >
                    {paymentTypeLabel}
                  </span>
                </div>
                <Typography
                  sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#a63b00', lineHeight: 1 }}
                >
                  {formatCurrency(amount, currency)}
                </Typography>
              </Box>

              {/* Saldo Pendiente */}
              <Box sx={{ flex: 1, px: 2.5, py: 2, textAlign: 'center' }}>
                <Typography
                  sx={{
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#94a3b8',
                    mb: 0.5,
                  }}
                >
                  Saldo Pendiente
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: balance > 0 ? '#ba1a1a' : '#15803d',
                    lineHeight: 1,
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
                  bgcolor: '#f8fafc',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <Typography
                  sx={{
                    flex: 1,
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#64748b',
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
                    color: '#64748b',
                    textAlign: 'right',
                    minWidth: 110,
                  }}
                >
                  Importe
                </Typography>
              </Box>

              {/* Subtotal */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 3,
                  py: 1.5,
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <Typography sx={{ flex: 1, fontSize: '0.85rem', color: '#334155' }}>
                  Subtotal (sin IVA)
                </Typography>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', minWidth: 110, textAlign: 'right' }}>
                  {formatCurrency(subTotal, currency)}
                </Typography>
              </Box>

              {/* IVA */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 3,
                  py: 1.5,
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <Typography sx={{ flex: 1, fontSize: '0.85rem', color: '#334155' }}>
                  IVA (16%)
                </Typography>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', minWidth: 110, textAlign: 'right' }}>
                  {formatCurrency(iva, currency)}
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
                  <Typography sx={{ flex: 1, fontSize: '0.85rem', color: '#334155' }}>
                    Comisión por Transferencia
                  </Typography>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', minWidth: 110, textAlign: 'right' }}>
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
                  bgcolor: '#f8fafc',
                }}
              >
                <Typography sx={{ flex: 1, fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                  TOTAL DEL PAGO
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: '#a63b00',
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
                  borderTop: '1px solid #f1f5f9',
                  bgcolor: '#fafafa',
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
                borderTop: '1px solid #e2e8f0',
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
                  mx: 3,
                  mb: 3,
                  p: 2,
                  borderRadius: '10px',
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  gap: 2,
                  alignItems: 'flex-start',
                }}
              >
                {agencyInfo.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={agencyInfo.logoUrl}
                    alt={agencyInfo.name}
                    style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 6, flexShrink: 0 }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: '#a63b00',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ color: '#fff', fontSize: '24px', lineHeight: 1 }}
                    >
                      travel_explore
                    </span>
                  </Box>
                )}

                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', mb: 0.25 }}>
                    {agencyInfo.name}
                  </Typography>
                  {(agencyInfo.address || agencyInfo.city) && (
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
                      {[agencyInfo.address, agencyInfo.city, agencyInfo.state]
                        .filter(Boolean)
                        .join(', ')}
                      {agencyInfo.zipCode && ` C.P. ${agencyInfo.zipCode}`}
                    </Typography>
                  )}
                  {agencyInfo.phone && (
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>
                      Tel: {agencyInfo.phone}
                    </Typography>
                  )}
                  {agencyInfo.secturReg && (
                    <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', mt: 0.5, fontWeight: 600 }}>
                      Reg. SECTUR {agencyInfo.secturReg}
                    </Typography>
                  )}
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
          borderTop: '1px solid #e2e8f0',
          bgcolor: '#f8fafc',
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
