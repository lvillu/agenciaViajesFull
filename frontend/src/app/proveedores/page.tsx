/**
 * Proveedores Page
 * Gestión completa de proveedores (CRUD)
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { ProviderFormModal } from '@/components/shared/ProviderFormModal';
import { useProviders } from '@/hooks/useProviders';
import { useAlert } from '@/hooks/useAlert';
import { Provider } from '@/types/provider';
import { ProviderFormData } from '@/lib/validationSchemas';

export default function ProveedoresPage() {
  const {
    providers,
    loading,
    error,
    createProvider,
    updateProvider,
    deleteProvider,
  } = useProviders();

  const { showSuccess, showError } = useAlert();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<Provider | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  // Filtrar proveedores según el término de búsqueda
  const filteredProviders = useMemo(() => {
    if (!searchTerm.trim()) return providers;

    const term = searchTerm.toLowerCase();
    return providers.filter(
      (provider) =>
        provider.name.toLowerCase().includes(term) ||
        provider.acronym.toLowerCase().includes(term) ||
        provider.email.toLowerCase().includes(term) ||
        provider.phone.toLowerCase().includes(term) ||
        provider.providerContactName.toLowerCase().includes(term)
    );
  }, [providers, searchTerm]);

  const totalPages = Math.ceil(filteredProviders.length / rowsPerPage);
  const paginatedProviders = filteredProviders.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  // Abrir modal para crear
  const handleOpenCreate = () => {
    setSelectedProvider(null);
    setModalOpen(true);
  };

  // Abrir modal para editar
  const handleOpenEdit = (provider: Provider) => {
    setSelectedProvider(provider);
    setModalOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProvider(null);
  };

  // Enviar formulario (crear o actualizar)
  const handleSubmit = async (data: ProviderFormData) => {
    try {
      if (selectedProvider) {
        // Actualizar
        const result = await updateProvider(selectedProvider.id, {
          ...data,
          active: selectedProvider.active,
        });
        if (result) {
          handleCloseModal();
          await showSuccess('El proveedor ha sido actualizado exitosamente');
        }
      } else {
        // Crear
        const result = await createProvider(data);
        if (result) {
          handleCloseModal();
          await showSuccess('El proveedor ha sido creado exitosamente');
        }
      }
    } catch (err: any) {
      await showError(err.message || 'Error al guardar el proveedor');
    }
  };

  // Abrir diálogo de confirmación de eliminación
  const handleOpenDeleteDialog = (provider: Provider) => {
    setProviderToDelete(provider);
    setDeleteDialogOpen(true);
  };

  // Cerrar diálogo de eliminación
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setProviderToDelete(null);
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!providerToDelete) return;

    const success = await deleteProvider(providerToDelete.id);
    handleCloseDeleteDialog();
    
    if (success) {
      await showSuccess('El proveedor ha sido dado de baja exitosamente');
    } else {
      await showError('Error al dar de baja al proveedor');
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Container maxWidth="xl" sx={{ py: 4, flex: 1, px: { xs: 2, sm: 3, lg: 4 } }}>
        <Breadcrumbs items={[{ label: 'Proveedores' }]} />

        {/* Header con título y botón */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h1" sx={{ color: 'text.primary', fontWeight: 800 }}>
            Proveedores
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{ px: 3 }}
          >
            Agregar Proveedor
          </Button>
        </Box>

        {/* Mensaje de error general */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Barra de búsqueda separada */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            px: 1,
            py: 0.5,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <SearchIcon sx={{ color: 'text.disabled', ml: 1, mr: 0.5, flexShrink: 0 }} />
          <TextField
            fullWidth
            variant="standard"
            placeholder="Buscar por nombre, acrónimo, email, teléfono o contacto..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            slotProps={{
              input: {
                disableUnderline: true,
                sx: { fontSize: '15px', py: 1 },
              },
            }}
          />
        </Box>

        {/* Card con tabla de proveedores */}
        <Card
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {/* Tabla con scroll */}
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(189, 191, 220, 0.15)' }}>
                    {[
                      { label: 'Nombre', align: 'left' },
                      { label: 'Acrónimo', align: 'left' },
                      { label: 'Contacto', align: 'left' },
                      { label: 'Gestor', align: 'left' },
                      { label: 'Anticipo %', align: 'center' },
                      { label: 'Días Finales', align: 'center' },
                      { label: 'Estado', align: 'left' },
                      { label: 'Acciones', align: 'right' },
                    ].map(({ label, align }) => (
                      <TableCell
                        key={label}
                        sx={{
                          fontWeight: 700,
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.07em',
                          color: 'text.secondary',
                          py: 1.5,
                          textAlign: align as any,
                          borderBottom: '2px solid',
                          borderColor: 'divider',
                        }}
                      >
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Cargando proveedores...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading && filteredProviders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          {searchTerm.trim() 
                            ? 'No se encontraron proveedores que coincidan con la búsqueda'
                            : 'No hay proveedores registrados'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading &&
                    paginatedProviders.map((provider) => (
                      <TableRow
                        key={provider.id}
                        sx={{
                          '&:hover': { bgcolor: 'rgba(189, 191, 220, 0.1)' },
                          transition: 'background-color 0.15s',
                        }}
                      >
                        {/* Nombre con avatar de acrónimo */}
                        <TableCell sx={{ minWidth: 200 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                              sx={{
                                width: 32, height: 32, borderRadius: 1.5,
                                bgcolor: 'rgba(189, 191, 220, 0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#5BA9B3', fontWeight: 700, fontSize: '11px',
                                flexShrink: 0,
                              }}
                            >
                              {provider.acronym}
                            </Box>
                            <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#525252' }}>
                              {provider.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        {/* Acrónimo */}
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {provider.acronym}
                          </Typography>
                        </TableCell>
                        {/* Contacto: email + teléfono combinados */}
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography sx={{ fontSize: '13px', color: '#525252' }}>
                              {provider.email}
                            </Typography>
                            <Typography sx={{ fontSize: '12px', color: '#ADB0C8' }}>
                              {provider.phone}
                            </Typography>
                          </Box>
                        </TableCell>
                        {/* Gestor */}
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {provider.providerContactName}
                          </Typography>
                        </TableCell>
                        {/* Anticipo % */}
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#525252' }}>
                            {provider.depositPercentage !== null && provider.depositPercentage !== undefined
                              ? `${provider.depositPercentage}%`
                              : '-'}
                          </Typography>
                        </TableCell>
                        {/* Días Finales */}
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            {provider.finalPaymentDaysBefore !== null && provider.finalPaymentDaysBefore !== undefined
                              ? provider.finalPaymentDaysBefore
                              : '-'}
                          </Typography>
                        </TableCell>
                        {/* Estado */}
                        <TableCell>
                          <Chip
                            label={provider.active ? 'Activo' : 'Inactivo'}
                            size="small"
                            sx={{
                              bgcolor: provider.active ? '#dcfce7' : 'rgba(189, 191, 220, 0.25)',
                              color: provider.active ? '#16a34a' : '#8B8DA8',
                              fontWeight: 700,
                              fontSize: '11px',
                              border: 'none',
                            }}
                          />
                        </TableCell>
                        {/* Acciones */}
                        <TableCell sx={{ textAlign: 'right' }}>
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEdit(provider)}
                              title="Editar"
                              sx={{ color: 'text.secondary', borderRadius: 1.5, '&:hover': { color: 'text.primary', bgcolor: 'rgba(189, 191, 220, 0.15)' } }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDeleteDialog(provider)}
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

            {/* Paginación */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 3,
                py: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'rgba(189, 191, 220, 0.15)',
              }}
            >
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {filteredProviders.length > 0
                  ? `Mostrando ${page * rowsPerPage + 1} a ${Math.min((page + 1) * rowsPerPage, filteredProviders.length)} de ${filteredProviders.length} proveedores`
                  : 'Sin resultados'}
              </Typography>
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
                  <IconButton
                    size="small"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    sx={{
                      width: 36, height: 36, borderRadius: 1.5,
                      border: '1px solid', borderColor: 'divider',
                      bgcolor: 'background.paper',
                      '&.Mui-disabled': { opacity: 0.4 },
                    }}
                  >
                    <ChevronLeftIcon fontSize="small" />
                  </IconButton>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <IconButton
                      key={i}
                      size="small"
                      onClick={() => setPage(i)}
                      sx={{
                        width: 36, height: 36, borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: page === i ? 'primary.main' : 'divider',
                        bgcolor: page === i ? 'primary.main' : 'background.paper',
                        color: page === i ? 'white' : 'text.secondary',
                        fontWeight: page === i ? 700 : 400,
                        fontSize: '14px',
                        '&:hover': {
                          bgcolor: page === i ? 'primary.dark' : 'rgba(189, 191, 220, 0.15)',
                        },
                      }}
                    >
                      {i + 1}
                    </IconButton>
                  ))}
                  <IconButton
                    size="small"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    sx={{
                      width: 36, height: 36, borderRadius: 1.5,
                      border: '1px solid', borderColor: 'divider',
                      bgcolor: 'background.paper',
                      '&.Mui-disabled': { opacity: 0.4 },
                    }}
                  >
                    <ChevronRightIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>
      <Footer />

      {/* Modal de crear/editar proveedor */}
      <ProviderFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        provider={selectedProvider}
        isLoading={loading}
      />

      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea dar de baja al proveedor{' '}
            <strong>{providerToDelete?.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleCloseDeleteDialog}
            variant="outlined"
            color="inherit"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            isLoading={loading}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}