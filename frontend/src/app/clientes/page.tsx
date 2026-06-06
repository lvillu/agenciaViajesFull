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
} from '@mui/material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
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
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  // Filtrar clientes según el término de búsqueda
  const filteredClients = useMemo(() => {
    setPage(0);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients, searchTerm]);

  const totalPages = Math.ceil(filteredClients.length / rowsPerPage);
  const paginatedClients = filteredClients.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

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
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Container maxWidth="xl" sx={{ py: 4, flex: 1, px: { xs: 2, sm: 3, lg: 4 } }}>
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
          <Typography variant="h1" sx={{ color: 'text.primary', fontWeight: 800 }}>
            Clientes
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddAlt1Icon />}
            onClick={handleOpenCreate}
            sx={{ px: 3 }}
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
          <SearchIcon sx={{ color: '#ADB0C8', ml: 1, mr: 0.5, flexShrink: 0 }} />
          <TextField
            fullWidth
            variant="standard"
            placeholder="Buscar clientes por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                disableUnderline: true,
                sx: { fontSize: '15px', py: 1 },
              },
            }}
          />
        </Box>

        {/* Card con tabla de clientes */}
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
                    {['Nombre', 'Apellido', 'Email', 'Teléfono', 'Dirección', 'Fecha Nac.', 'Estado', 'Acciones'].map((h, i) => (
                      <TableCell
                        key={h}
                        sx={{
                          fontWeight: 700,
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.07em',
                          color: 'text.secondary',
                          py: 1.5,
                          textAlign: i === 7 ? 'center' : 'left',
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
                    paginatedClients.map((client) => (
                      <TableRow
                        key={client.id}
                        sx={{
                          '&:hover': { bgcolor: 'rgba(189, 191, 220, 0.1)' },
                          transition: 'background-color 0.15s',
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
                            size="small"
                            sx={{
                              bgcolor: client.active ? '#dcfce7' : 'rgba(189, 191, 220, 0.25)',
                              color: client.active ? '#16a34a' : '#8B8DA8',
                              fontWeight: 700,
                              fontSize: '11px',
                              border: 'none',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEdit(client)}
                              title="Editar"
                              sx={{ color: 'text.secondary', borderRadius: 1.5, '&:hover': { color: 'primary.main', bgcolor: 'primary.light' } }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDeleteDialog(client)}
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
                py: 1.5,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'rgba(189, 191, 220, 0.15)',
              }}
            >
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {filteredClients.length > 0
                  ? `Mostrando ${page * rowsPerPage + 1} a ${Math.min((page + 1) * rowsPerPage, filteredClients.length)} de ${filteredClients.length} clientes`
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
                          bgcolor: page === i ? 'primary.dark' : '#f1f5f9',
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
