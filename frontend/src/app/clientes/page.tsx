/**
 * Clientes Page
 * Gestión completa de clientes (CRUD)
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
import { ClientFormModal } from '@/components/shared/ClientFormModal';
import { useClients } from '@/hooks/useClients';
import { useAlert } from '@/hooks/useAlert';
import { Client } from '@/types/client';
import { ClientFormData } from '@/lib/validationSchemas';

export default function ClientesPage() {
  const {
    clients,
    loading,
    error,
    createClient,
    updateClient,
    deleteClient,
  } = useClients();

  const { showSuccess, showError } = useAlert();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar clientes según el término de búsqueda
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;

    const term = searchTerm.toLowerCase();
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(term) ||
        client.lastName.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        client.phone.toLowerCase().includes(term) ||
        (client.address && client.address.toLowerCase().includes(term))
    );
  }, [clients, searchTerm]);

  // Abrir modal para crear
  const handleOpenCreate = () => {
    setSelectedClient(null);
    setModalOpen(true);
  };

  // Abrir modal para editar
  const handleOpenEdit = (client: Client) => {
    setSelectedClient(client);
    setModalOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedClient(null);
  };

  // Enviar formulario (crear o actualizar)
  const handleSubmit = async (data: ClientFormData) => {
    try {
      if (selectedClient) {
        // Actualizar
        const result = await updateClient(selectedClient.id, {
          ...data,
          active: selectedClient.active,
        });
        if (result) {
          handleCloseModal();
          await showSuccess('El cliente ha sido actualizado exitosamente');
        }
      } else {
        // Crear
        const result = await createClient(data);
        if (result) {
          handleCloseModal();
          await showSuccess('El cliente ha sido creado exitosamente');
        }
      }
    } catch (err: any) {
      await showError(err.message || 'Error al guardar el cliente');
    }
  };

  // Abrir diálogo de confirmación de eliminación
  const handleOpenDeleteDialog = (client: Client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  // Cerrar diálogo de eliminación
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setClientToDelete(null);
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;

    const success = await deleteClient(clientToDelete.id);
    handleCloseDeleteDialog();
    
    if (success) {
      await showSuccess('El cliente ha sido dado de baja exitosamente');
    } else {
      await showError('Error al dar de baja al cliente');
    }
  };

  // Formatear fecha de nacimiento
  const formatBirthDate = (birthDate?: string): string => {
    if (!birthDate) return 'N/A';
    try {
      const date = new Date(birthDate);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumbs items={[{ label: 'Clientes' }]} />

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
            Clientes
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            Agregar Cliente
          </Button>
        </Box>

        {/* Mensaje de error general */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Card con tabla de clientes */}
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
                placeholder="Buscar por nombre, apellido, email, teléfono o dirección..."
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
                    <TableCell sx={{ fontWeight: 600 }}>Apellido</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Teléfono</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Dirección</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Fecha Nac.</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Cargando clientes...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading && filteredClients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          {searchTerm.trim() 
                            ? 'No se encontraron clientes que coincidan con la búsqueda'
                            : 'No hay clientes registrados'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading &&
                    filteredClients.map((client) => (
                      <TableRow
                        key={client.id}
                        sx={{
                          '&:hover': { bgcolor: 'grey.50' },
                        }}
                      >
                        <TableCell>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {client.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {client.lastName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {client.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {client.phone}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {client.address || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatBirthDate(client.birthDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={client.active ? 'Activo' : 'Inactivo'}
                            color={client.active ? 'success' : 'error'}
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
                              onClick={() => handleOpenEdit(client)}
                              title="Editar"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenDeleteDialog(client)}
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

      {/* Modal de crear/editar cliente */}
      <ClientFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        client={selectedClient}
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
            ¿Está seguro que desea dar de baja al cliente{' '}
            <strong>{clientToDelete?.name} {clientToDelete?.lastName}</strong>?
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
