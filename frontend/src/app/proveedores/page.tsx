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
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { Header } from '@/components/shared/Header';
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
        <Card 
          sx={{ 
            borderRadius: 3, 
            boxShadow: 2,
            my: '15px',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {/* Campo de búsqueda */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Buscar por nombre, acrónimo, email, teléfono o contacto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Box>

            {/* Tabla con scroll */}
            <TableContainer sx={{ maxHeight: 600, overflowY: 'auto' }}>
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

                  {!loading && filteredProviders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          {searchTerm.trim() 
                            ? 'No se encontraron proveedores que coincidan con la búsqueda'
                            : 'No hay proveedores registrados'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading &&
                    filteredProviders.map((provider) => (
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
                            color={provider.active ? 'success' : 'error'}
                            size="small"
                            sx={{
                              color: '#FFFFFF',
                              fontWeight: 500,
                            }}
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
    </Box>
  );
}