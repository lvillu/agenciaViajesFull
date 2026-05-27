/**
 * Reservas Page
 * Gestión completa de reservas/ventas (CRUD)
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PaymentIcon from '@mui/icons-material/Payment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { ViewPaymentsModal } from '@/components/shared/ViewPaymentsModal';
import { AddPaymentModal } from '@/components/shared/AddPaymentModal';
import { useSales } from '@/hooks/useSales';
import { usePayments } from '@/hooks/usePayments';
import { Sale, SaleWithTotals } from '@/types/sale';
import { saleService } from '@/services/saleService';

export default function ReservasPage() {
  const router = useRouter();
  const { sales, loading, error, deleteSale, fetchSales } = useSales();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modales de pagos
  const [viewPaymentsModalOpen, setViewPaymentsModalOpen] = useState(false);
  const [addPaymentModalOpen, setAddPaymentModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<SaleWithTotals | null>(null);

  const {
    payments,
    loading: loadingPayments,
    error: errorPayments,
    fetchPayments,
  } = usePayments(selectedSale?.id || null);

  // Calcular totales para todas las ventas
  const salesWithTotals = useMemo(() => {
    return sales.map((sale) => saleService.calculateTotals(sale));
  }, [sales]);

  // Filtrar ventas según el término de búsqueda
  const filteredSales = useMemo(() => {
    if (!searchTerm.trim()) return salesWithTotals;

    const term = searchTerm.toLowerCase();
    return salesWithTotals.filter(
      (sale) =>
        sale.reservationNumber?.toLowerCase().includes(term) ||
        sale.description?.toLowerCase().includes(term) ||
        sale.clientName?.toLowerCase().includes(term) ||
        sale.providerName?.toLowerCase().includes(term)
    );
  }, [salesWithTotals, searchTerm]);

  // Navegar a crear (usar URL absoluta para evitar que se arrastren query params)
  const handleCreate = () => {
    if (typeof window !== 'undefined') {
      const url = new URL('/reservas/nueva', window.location.origin);
      router.push(url.toString());
    } else {
      router.push('/reservas/nueva');
    }
  };

  // Navegar a editar
  const handleEdit = (sale: Sale) => {
    router.push(`/reservas/nueva?id=${sale.id}`);
  };

  // Abrir diálogo de eliminar
  const handleOpenDelete = (sale: Sale) => {
    setSaleToDelete(sale);
    setDeleteDialogOpen(true);
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!saleToDelete) return;

    const success = await deleteSale(saleToDelete.id);
    if (success) {
      setDeleteDialogOpen(false);
      setSaleToDelete(null);
    }
  };

  // Abrir modal de ver pagos
  const handleViewPayments = async (sale: SaleWithTotals) => {
    setSelectedSale(sale);
    setViewPaymentsModalOpen(true);
  };

  // Abrir modal de agregar pago
  const handleAddPayment = async (sale: SaleWithTotals) => {
    setSelectedSale(sale);
    setAddPaymentModalOpen(true);
  };

  // Cerrar modales y recargar
  const handleClosePaymentsModal = () => {
    setViewPaymentsModalOpen(false);
    setSelectedSale(null);
  };

  const handleCloseAddPaymentModal = () => {
    setAddPaymentModalOpen(false);
    setSelectedSale(null);
  };

  const handlePaymentAdded = () => {
    fetchPayments();
    fetchSales();
  };

  const formatCurrency = (amount: number, isDollar: boolean) => {
    return isDollar
      ? `$${amount.toFixed(2)} USD`
      : `$${amount.toFixed(2)} MXN`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusChip = (sale: SaleWithTotals) => {
    if (sale.balance === 0) {
      return (
        <Chip
          label="Liquidado"
          size="small"
          sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 700, fontSize: '11px', border: 'none' }}
        />
      );
    }
    if (sale.isOverdue) {
      return (
        <Chip
          label="Vencido"
          size="small"
          sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 700, fontSize: '11px', border: 'none' }}
        />
      );
    }
    if (sale.totalPaid > 0) {
      return (
        <Chip
          label="Pago Parcial"
          size="small"
          sx={{ bgcolor: '#fef9c3', color: '#854d0e', fontWeight: 700, fontSize: '11px', border: 'none' }}
        />
      );
    }
    return (
      <Chip
        label="Pendiente"
        size="small"
        sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontWeight: 700, fontSize: '11px', border: 'none' }}
      />
    );
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Container maxWidth="xl" sx={{ py: 4, flex: 1, px: { xs: 2, sm: 3, lg: 4 } }}>
        <Breadcrumbs items={[{ label: 'Reservas' }]} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h1" sx={{ color: 'text.primary', fontWeight: 800 }}>
            Reservas
          </Typography>
          <Button 
            onClick={handleCreate} 
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ px: 3 }}
          >
            Nueva Reserva
          </Button>
        </Box>

        {/* Buscador */}
        <Box sx={{ mb: 2 }}>
          <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <CardContent sx={{ p: '8px !important' }}>
              <TextField
                fullWidth
                variant="standard"
                placeholder="Buscar por cliente, proveedor, número de reserva o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                slotProps={{
                  input: {
                    disableUnderline: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'text.disabled', ml: 1 }} />
                      </InputAdornment>
                    ),
                    sx: { fontSize: '15px', py: 0.5 },
                  },
                }}
              />
            </CardContent>
          </Card>
        </Box>

        {/* Mensajes */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Tabla */}
        <Card
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
            my: 2,
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    {['Cliente', 'Proveedor', 'Descripción', 'Fecha Viaje', 'Total', 'Pagado', 'Saldo', 'Ganancia', 'Estado', 'Acciones'].map((h, i) => (
                      <TableCell
                        key={h}
                        sx={{
                          fontWeight: 700,
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.07em',
                          color: 'text.secondary',
                          py: 1.5,
                          textAlign: (i >= 4 && i <= 7) ? 'right' : i === 9 ? 'center' : 'left',
                          borderBottom: '2px solid',
                          borderColor: 'divider',
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={10} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Cargando reservas...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                      {!loading && filteredSales.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          {searchTerm
                            ? 'No se encontraron reservas que coincidan con la búsqueda'
                            : 'No hay reservas registradas'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading &&
                    filteredSales.map((sale) => (
                      <TableRow 
                        key={sale.id} 
                        sx={{ '&:hover': { bgcolor: '#f8fafc' }, transition: 'background-color 0.15s' }}
                      >
                        <TableCell>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {sale.clientName || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {sale.providerName || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                            {sale.description || sale.reservationNumber || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(sale.travelDate)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontWeight: 'medium' }}>
                            {formatCurrency(sale.totalAmount, sale.isDollar)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography color="success.main">
                            {formatCurrency(sale.totalPaid, sale.isDollar)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            color={sale.balance > 0 ? 'error.main' : 'success.main'}
                            sx={{ fontWeight: 'medium' }}
                          >
                            {formatCurrency(sale.balance, sale.isDollar)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {sale.profitAmount != null && sale.profitAmount > 0 ? (
                            <Typography sx={{ color: '#16a34a', fontWeight: 700 }}>
                              {formatCurrency(sale.profitAmount, sale.isDollar)}
                            </Typography>
                          ) : sale.profitPercentage != null ? (
                            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {sale.profitPercentage}%
                            </Typography>
                          ) : (
                            <Typography sx={{ color: '#cbd5e1' }}>—</Typography>
                          )}
                        </TableCell>
                        <TableCell>{getStatusChip(sale)}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <IconButton
                              size="small"
                              onClick={() => handleViewPayments(sale)}
                              title="Ver Pagos"
                              sx={{ color: 'text.secondary', borderRadius: 1.5, '&:hover': { color: 'primary.main', bgcolor: 'primary.light' } }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleAddPayment(sale)}
                              title="Agregar Pago"
                              sx={{ color: 'text.secondary', borderRadius: 1.5, '&:hover': { color: 'success.main', bgcolor: '#dcfce7' } }}
                            >
                              <PaymentIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(sale)}
                              title="Editar"
                              sx={{ color: 'text.secondary', borderRadius: 1.5, '&:hover': { color: 'text.primary', bgcolor: '#f1f5f9' } }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDelete(sale)}
                              title="Eliminar"
                              sx={{ color: 'text.secondary', borderRadius: 1.5, '&:hover': { color: 'error.main', bgcolor: '#fee2e2' } }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Modal de confirmación de eliminación */}
        <Dialog 
          open={deleteDialogOpen} 
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Estás seguro de que deseas eliminar la reserva{' '}
              <strong>{saleToDelete?.reservationNumber || saleToDelete?.description}</strong>?
              Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button 
              onClick={() => setDeleteDialogOpen(false)} 
              variant="outlined"
              color="inherit"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmDelete} 
              variant="contained" 
              color="error"
            >
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal de ver pagos */}
        {selectedSale && (
          <ViewPaymentsModal
            open={viewPaymentsModalOpen}
            onClose={handleClosePaymentsModal}
            payments={payments}
            loading={loadingPayments}
            error={errorPayments}
            isDollar={selectedSale.isDollar}
            totalAmount={selectedSale.totalAmount}
            sale={selectedSale}
          />
        )}

        {/* Modal de agregar pago */}
        {selectedSale && (
          <AddPaymentModal
            open={addPaymentModalOpen}
            onClose={handleCloseAddPaymentModal}
            saleId={selectedSale.id}
            totalAmount={selectedSale.totalAmount}
            totalPaid={selectedSale.totalPaid}
            isDollar={selectedSale.isDollar}
            onPaymentAdded={handlePaymentAdded}
          />
        )}
      </Container>
      <Footer />
    </Box>
  );
}

