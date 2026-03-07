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
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PaymentIcon from '@mui/icons-material/Payment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/shared/Header';
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
        sale.client?.name.toLowerCase().includes(term) ||
        sale.client?.lastName.toLowerCase().includes(term) ||
        sale.provider?.name.toLowerCase().includes(term) ||
        sale.provider?.acronym.toLowerCase().includes(term)
    );
  }, [salesWithTotals, searchTerm]);

  // Navegar a crear
  const handleCreate = () => {
    router.push('/reservas/nueva');
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
      return <Chip label="Liquidado" color="success" size="small" />;
    }
    if (sale.isOverdue) {
      return <Chip label="Vencido" color="error" size="small" />;
    }
    if (sale.totalPaid > 0) {
      return <Chip label="Pago Parcial" color="warning" size="small" />;
    }
    return <Chip label="Pendiente" color="default" size="small" />;
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Breadcrumbs items={[{ label: 'Reservas' }]} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h1" sx={{ color: 'text.primary' }}>
            Reservas
          </Typography>
          <Button onClick={handleCreate} startIcon={<AddIcon />}>
            Nueva Reserva
          </Button>
        </Box>

        {/* Buscador */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Buscar por cliente, proveedor, número de reserva o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Mensajes */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Tabla */}
        <Card elevation={0}>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Proveedor</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Fecha Viaje</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Pagado</TableCell>
                    <TableCell align="right">Saldo</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        Cargando...
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && filteredSales.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
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
                      <TableRow key={sale.id} hover>
                        <TableCell>
                          {sale.client
                            ? `${sale.client.name} ${sale.client.lastName}`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {sale.provider
                            ? `${sale.provider.name} (${sale.provider.acronym})`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {sale.description || sale.reservationNumber || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDate(sale.travelDate)}</TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="medium">
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
                            fontWeight="medium"
                          >
                            {formatCurrency(sale.balance, sale.isDollar)}
                          </Typography>
                        </TableCell>
                        <TableCell>{getStatusChip(sale)}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <Tooltip title="Ver Pagos">
                              <IconButton
                                size="small"
                                onClick={() => handleViewPayments(sale)}
                                color="info"
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Agregar Pago">
                              <IconButton
                                size="small"
                                onClick={() => handleAddPayment(sale)}
                                color="success"
                              >
                                <PaymentIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(sale)}
                                color="primary"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDelete(sale)}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
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
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Estás seguro de que deseas eliminar la reserva{' '}
              {saleToDelete?.reservationNumber || saleToDelete?.description}?
              Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
              Cancelar
            </Button>
            <Button onClick={handleConfirmDelete} variant="contained" color="error">
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
    </Box>
  );
}

