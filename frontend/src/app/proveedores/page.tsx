/**
 * Proveedores Page
 * Gestión completa de proveedores (CRUD)
 */

'use client';

import React, { useState } from 'react';
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
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Header } from '@/components/shared/Header';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { ProviderFormModal } from '@/components/shared/ProviderFormModal';
import { useProviders } from '@/hooks/useProviders';
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

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<Provider | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

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
          setSnackbar({
            open: true,
            message: 'Proveedor actualizado exitosamente',
            severity: 'success',
          });
          handleCloseModal();
        }
      } else {
        // Crear
        const result = await createProvider(data);
        if (result) {
          setSnackbar({
            open: true,
            message: 'Proveedor creado exitosamente',
            severity: 'success',
          });
          handleCloseModal();
        }
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Error al guardar proveedor',
        severity: 'error',
      });
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
    if (success) {
      setSnackbar({
        open: true,
        message: 'Proveedor eliminado exitosamente',
        severity: 'success',
      });
    } else {
      setSnackbar({
        open: true,
        message: 'Error al eliminar proveedor',
        severity: 'error',
      });
    }
    handleCloseDeleteDialog();
  };

  // Cerrar snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
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
          <Typography variant="h1" sx={{ color: 'text.primary' }}>
            Proveedores
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
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

        {/* Card con tabla de proveedores */}
        <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Acrónimo</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Teléfono</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Contacto</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Cargando proveedores...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading && providers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No hay proveedores registrados
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading &&
                    providers.map((provider) => (
                      <TableRow
                        key={provider.id}
                        sx={{
                          '&:hover': { bgcolor: 'grey.50' },
                        }}
                      >
                        <TableCell>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {provider.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {provider.acronym}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {provider.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {provider.phone}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {provider.providerContactName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={provider.active ? 'Activo' : 'Inactivo'}
                            color={provider.active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenEdit(provider)}
                              title="Editar"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenDeleteDialog(provider)}
                              title="Eliminar"
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
      </Container>

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

      {/* Snackbar para mensajes de éxito/error */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
