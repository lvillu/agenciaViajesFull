/**
 * DashboardCards Component
 * 3 tarjetas resumen: Ganancias estimadas, Por liquidar, Cerca de cancelarse
 */

'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Alert,
  Tooltip,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventNoteIcon from '@mui/icons-material/EventNote';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { DashboardCardsResponse, DashboardSaleItem } from '@/types/dashboard';

interface DashboardCardsProps {
  data: DashboardCardsResponse | null;
  loading: boolean;
  error: string | null;
}

const formatCurrency = (amount: number, isDollar = false) => {
  const locale = isDollar ? 'en-US' : 'es-MX';
  const currency = isDollar ? 'USD' : 'MXN';
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// ─── Skeleton para una card ──────────────────────────────────────────────────
const CardSkeleton: React.FC = () => (
  <Card sx={{ borderRadius: '12px', border: '1px solid #D8DAEA', boxShadow: 'none', flex: 1, minWidth: 0 }}>
    <CardContent sx={{ p: 3 }}>
      <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: '10px', mb: 2 }} />
      <Skeleton variant="text" width="60%" height={18} />
      <Skeleton variant="text" width="40%" height={36} sx={{ mt: 0.5 }} />
      <Skeleton variant="text" width="50%" height={16} sx={{ mt: 1 }} />
    </CardContent>
  </Card>
);

// ─── Modal de detalle de reservas ───────────────────────────────────────────
interface SalesDetailModalProps {
  open: boolean;
  title: string;
  sales: DashboardSaleItem[];
  onClose: () => void;
}

const SalesDetailModal: React.FC<SalesDetailModalProps> = ({ open, title, sales, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #D8DAEA',
        pb: 2,
        fontWeight: 700,
        fontSize: '18px',
      }}
    >
      {title}
      <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </DialogTitle>
    <DialogContent sx={{ p: 0 }}>
      {sales.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No hay reservas para mostrar.
          </Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(189,191,220,0.18)' }}>
                {['Cliente', 'Proveedor', '# Reserva', 'Total', 'Saldo', 'Fecha límite', 'Viaje'].map((h) => (
                  <TableCell
                    key={h}
                    sx={{ fontWeight: 600, fontSize: '12px', color: 'text.secondary', py: 1.5 }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sales.map((s) => (
                <TableRow
                  key={s.id}
                  sx={{ '&:hover': { bgcolor: 'rgba(91,169,179,0.04)' }, transition: 'background 0.15s' }}
                >
                  <TableCell sx={{ fontSize: '13px', fontWeight: 500 }}>{s.clientName || '—'}</TableCell>
                  <TableCell sx={{ fontSize: '13px' }}>{s.providerName || '—'}</TableCell>
                  <TableCell sx={{ fontSize: '13px' }}>
                    <Chip
                      label={s.reservationNumber || 'Sin #'}
                      size="small"
                      sx={{ bgcolor: 'rgba(99,102,241,0.1)', color: '#6366f1', fontWeight: 600, fontSize: '11px' }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '13px' }}>
                    {formatCurrency(s.totalAmount, s.isDollar)}
                    {s.isDollar && (
                      <Typography component="span" sx={{ fontSize: '10px', color: 'text.secondary', ml: 0.5 }}>
                        USD
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontSize: '13px', color: '#dc2626', fontWeight: 600 }}>
                    {formatCurrency(s.remainingBalance, s.isDollar)}
                  </TableCell>
                  <TableCell sx={{ fontSize: '13px' }}>{formatDate(s.finalPaymentDueDate)}</TableCell>
                  <TableCell sx={{ fontSize: '13px' }}>{formatDate(s.travelDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DialogContent>
  </Dialog>
);

// ─── Card individual ─────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  subLabel?: string;
  accentColor: string;
  clickable?: boolean;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  subLabel,
  accentColor,
  clickable,
  onClick,
}) => (
  <Card
    onClick={clickable ? onClick : undefined}
    sx={{
      borderRadius: '12px',
      border: '1px solid #D8DAEA',
      boxShadow: 'none',
      flex: 1,
      minWidth: 0,
      cursor: clickable ? 'pointer' : 'default',
      transition: 'box-shadow 0.2s, transform 0.15s',
      '&:hover': clickable
        ? { boxShadow: '0 4px 20px rgba(0,0,0,0.10)', transform: 'translateY(-2px)' }
        : {},
      position: 'relative',
      overflow: 'hidden',
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '4px',
        height: '100%',
        bgcolor: accentColor,
        borderRadius: '0 2px 2px 0',
      },
    }}
  >
    <CardContent sx={{ p: 3, pl: 3.5 }}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: '10px',
          bgcolor: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          color: iconColor,
        }}
      >
        {icon}
      </Box>
      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.1 }}>
        {value}
      </Typography>
      {subLabel && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px' }}>
            {subLabel}
          </Typography>
          {clickable && (
            <Tooltip title="Ver detalle">
              <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            </Tooltip>
          )}
        </Box>
      )}
    </CardContent>
  </Card>
);

// ─── Componente principal ────────────────────────────────────────────────────
export const DashboardCards: React.FC<DashboardCardsProps> = ({ data, loading, error }) => {
  const [pendingModalOpen, setPendingModalOpen] = useState(false);
  const [cancellationModalOpen, setCancellationModalOpen] = useState(false);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ borderRadius: '10px' }}>{error}</Alert>;
  }

  if (!data) return null;

  const currentMonthName = new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

  return (
    <>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Card 1 — Ganancias estimadas */}
        <StatCard
          icon={<TrendingUpIcon />}
          iconBg="rgba(91,169,179,0.12)"
          iconColor="#5BA9B3"
          accentColor="#5BA9B3"
          label="Ganancias estimadas"
          value={formatCurrency(data.estimatedProfitCurrentMonth)}
          subLabel={`Mes en curso · ${currentMonthName}`}
        />

        {/* Card 2 — Reservas por liquidar */}
        <StatCard
          icon={<EventNoteIcon />}
          iconBg="rgba(173,97,213,0.12)"
          iconColor="#AD61D5"
          accentColor="#AD61D5"
          label="Reservas por liquidar"
          value={String(data.pendingSettlementCount)}
          subLabel={`Mes en curso · Ver detalle`}
          clickable
          onClick={() => setPendingModalOpen(true)}
        />

        {/* Card 3 — Cerca de cancelarse */}
        <StatCard
          icon={<WarningAmberIcon />}
          iconBg="rgba(234,179,8,0.12)"
          iconColor="#ca8a04"
          accentColor="#ca8a04"
          label="Próximas a cancelarse"
          value={String(data.nearCancellationCount)}
          subLabel="Menos de 5 días · Ver detalle"
          clickable
          onClick={() => setCancellationModalOpen(true)}
        />
      </Box>

      {/* Modals */}
      <SalesDetailModal
        open={pendingModalOpen}
        title="Reservas por liquidar — Mes en curso"
        sales={data.pendingSettlementSales}
        onClose={() => setPendingModalOpen(false)}
      />
      <SalesDetailModal
        open={cancellationModalOpen}
        title="Reservas próximas a cancelarse (< 5 días)"
        sales={data.nearCancellationSales}
        onClose={() => setCancellationModalOpen(false)}
      />
    </>
  );
};
