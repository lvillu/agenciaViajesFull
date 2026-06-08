/**
 * Cuentas Page
 * Gestión de subcuentas — solo visible para el titular (role === 'owner')
 * CRUD completo: listar, crear, editar, eliminar
 */

'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSubAccounts } from '@/hooks/useSubAccounts';
import { useAuthStore } from '@/store/authStore';
import { SubAccount } from '@/types/subAccount';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Swal from 'sweetalert2';

/* ── Zod schemas ── */

const createSchema = z.object({
  name: z.string().min(1, 'Requerido').max(100, 'Máximo 100 caracteres'),
  lastName: z.string().min(1, 'Requerido').max(100, 'Máximo 100 caracteres'),
  userName: z.string().min(1, 'Requerido').max(50, 'Máximo 50 caracteres'),
  email: z.string().min(1, 'Requerido').email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener una mayúscula')
    .regex(/[a-z]/, 'Debe contener una minúscula')
    .regex(/[0-9]/, 'Debe contener un número')
    .regex(/[^A-Za-z0-9]/, 'Debe contener un carácter especial'),
  confirmPassword: z.string().min(1, 'Requerido'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type CreateForm = z.infer<typeof createSchema>;

const editSchema = z.object({
  name: z.string().min(1, 'Requerido').max(100, 'Máximo 100 caracteres'),
  lastName: z.string().min(1, 'Requerido').max(100, 'Máximo 100 caracteres'),
  email: z.string().min(1, 'Requerido').email('Email inválido'),
  active: z.boolean(),
});

type EditForm = z.infer<typeof editSchema>;

/* ── Page ── */

export default function CuentasPage() {
  const { user } = useAuthStore();
  const {
    subAccounts,
    loading,
    error,
    createSubAccount,
    updateSubAccount,
    deleteSubAccount,
  } = useSubAccounts();

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  // Modal state: null = closed, 'create' = create mode, SubAccount = edit mode
  const [modalMode, setModalMode] = useState<SubAccount | 'create' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Create form
  const createForm = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '', lastName: '', userName: '', email: '', password: '', confirmPassword: '' },
  });

  // Edit form
  const editForm = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: '', lastName: '', email: '', active: true },
  });

  // Filtering
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return subAccounts;
    const t = searchTerm.toLowerCase();
    return subAccounts.filter(
      (s) =>
        s.name.toLowerCase().includes(t) ||
        s.lastName.toLowerCase().includes(t) ||
        s.userName.toLowerCase().includes(t) ||
        s.email.toLowerCase().includes(t)
    );
  }, [subAccounts, searchTerm]);

  useEffect(() => { setPage(0); }, [searchTerm, subAccounts]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const isOwner = user?.role === 'owner';

  /* ── Modal handlers ── */

  const openCreate = () => {
    createForm.reset();
    setModalError(null);
    setModalMode('create');
  };

  const openEdit = (sub: SubAccount) => {
    editForm.reset({ name: sub.name, lastName: sub.lastName, email: sub.email, active: sub.active });
    setModalError(null);
    setModalMode(sub);
  };

  const closeModal = () => {
    setModalMode(null);
    setModalError(null);
  };

  const handleCreate = async (data: CreateForm) => {
    setSubmitting(true);
    setModalError(null);
    try {
      const result = await createSubAccount({
        name: data.name,
        lastName: data.lastName,
        userName: data.userName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      if (result) {
        closeModal();
        await Swal.fire({ icon: 'success', title: 'Subcuenta creada', timer: 2000, showConfirmButton: false });
      } else {
        setModalError('Error al crear la subcuenta. Verifica que el usuario no exista.');
      }
    } catch (err: any) {
      setModalError(err.message || 'Error al crear subcuenta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (data: EditForm) => {
    if (!modalMode || modalMode === 'create') return;
    setSubmitting(true);
    setModalError(null);
    try {
      const result = await updateSubAccount(modalMode.id, data);
      if (result) {
        closeModal();
        await Swal.fire({ icon: 'success', title: 'Subcuenta actualizada', timer: 2000, showConfirmButton: false });
      }
    } catch (err: any) {
      setModalError(err.message || 'Error al actualizar subcuenta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (sub: SubAccount) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar subcuenta?',
      text: `Se eliminará la subcuenta de "${sub.name} ${sub.lastName}" (@${sub.userName}).`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirm.isConfirmed) return;

    const success = await deleteSubAccount(sub.id);
    if (success) {
      await Swal.fire({ icon: 'success', title: 'Subcuenta eliminada', timer: 2000, showConfirmButton: false });
    } else {
      await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar la subcuenta' });
    }
  };

  /* ── Render ── */

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Container maxWidth="xl" sx={{ py: 4, flex: 1, px: { xs: 2, sm: 3, lg: 4 } }}>
        <Breadcrumbs items={[{ label: 'Cuentas' }]} />

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h1" sx={{ color: 'text.primary', fontWeight: 800 }}>
            Cuentas
          </Typography>
          {isOwner && (
            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={openCreate} sx={{ px: 3 }}>
              Agregar Cuenta
            </Button>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Search */}
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider', px: 1, py: 0.5, mb: 2, display: 'flex', alignItems: 'center' }}>
          <SearchIcon sx={{ color: 'text.disabled', ml: 1, mr: 0.5, flexShrink: 0 }} />
          <TextField
            fullWidth variant="standard"
            placeholder="Buscar por nombre, usuario o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{ input: { disableUnderline: true, sx: { fontSize: '15px', py: 1 } } }}
          />
        </Box>

        {!isOwner ? (
          /* Restricted view */
          <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <ManageAccountsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h3" sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
                Acceso restringido
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Solo el titular de la cuenta puede gestionar las subcuentas.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          /* Owner view — table */
          <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <CardContent sx={{ p: 0 }}>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'rgba(189, 191, 220, 0.15)' }}>
                      {['Nombre', 'Usuario', 'Email', 'Rol', 'Estado', 'Acciones'].map((h, i) => (
                        <TableCell
                          key={h}
                          sx={{
                            fontWeight: 700, fontSize: '11px', textTransform: 'uppercase',
                            letterSpacing: '0.07em', color: 'text.secondary', py: 1.5,
                            textAlign: i === 5 ? 'center' : 'left',
                            borderBottom: '2px solid', borderColor: 'divider',
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
                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body2" color="text.secondary">Cargando subcuentas...</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading && filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            {searchTerm.trim() ? 'Sin resultados' : 'No hay subcuentas registradas'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading && paginated.map((sub) => (
                      <TableRow
                        key={sub.id}
                        sx={{ '&:hover': { bgcolor: 'rgba(189, 191, 220, 0.1)' }, transition: 'background-color 0.15s' }}
                      >
                        <TableCell>
                          <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#525252' }}>
                            {sub.name} {sub.lastName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">@{sub.userName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{sub.email}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label="Subcuenta"
                            size="small"
                            sx={{
                              bgcolor: 'rgba(91, 169, 179, 0.12)',
                              color: '#5BA9B3',
                              fontWeight: 700, fontSize: '11px', border: 'none',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={sub.active ? 'Activa' : 'Inactiva'}
                            size="small"
                            sx={{
                              bgcolor: sub.active ? '#dcfce7' : 'rgba(189, 191, 220, 0.25)',
                              color: sub.active ? '#16a34a' : '#8B8DA8',
                              fontWeight: 700, fontSize: '11px', border: 'none',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <IconButton
                              size="small" onClick={() => openEdit(sub)} title="Editar"
                              sx={{ color: 'text.secondary', borderRadius: 1.5, '&:hover': { color: 'text.primary', bgcolor: 'rgba(189, 191, 220, 0.15)' } }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small" onClick={() => handleDelete(sub)} title="Eliminar"
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

              {/* Pagination */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'rgba(189, 191, 220, 0.15)' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {filtered.length > 0
                    ? `Mostrando ${page * rowsPerPage + 1} a ${Math.min((page + 1) * rowsPerPage, filtered.length)} de ${filtered.length} cuentas`
                    : 'Sin resultados'}
                </Typography>
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
                    <IconButton size="small" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
                      sx={{ width: 36, height: 36, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', '&.Mui-disabled': { opacity: 0.4 } }}>
                      <ChevronLeftIcon fontSize="small" />
                    </IconButton>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <IconButton key={i} size="small" onClick={() => setPage(i)}
                        sx={{
                          width: 36, height: 36, borderRadius: 1.5, border: '1px solid',
                          borderColor: page === i ? 'primary.main' : 'divider',
                          bgcolor: page === i ? 'primary.main' : 'background.paper',
                          color: page === i ? 'white' : 'text.secondary',
                          fontWeight: page === i ? 700 : 400, fontSize: '14px',
                          '&:hover': { bgcolor: page === i ? 'primary.dark' : 'rgba(189, 191, 220, 0.15)' },
                        }}>
                        {i + 1}
                      </IconButton>
                    ))}
                    <IconButton size="small" onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
                      sx={{ width: 36, height: 36, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', '&.Mui-disabled': { opacity: 0.4 } }}>
                      <ChevronRightIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
      <Footer />

      {/* ── Create Modal ── */}
      <Dialog open={modalMode === 'create'} onClose={closeModal} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: '12px' } } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.1rem', borderBottom: '1px solid', borderColor: 'divider', px: 4, py: 2.5 }}>
          Agregar Subcuenta
        </DialogTitle>
        <form onSubmit={createForm.handleSubmit(handleCreate)}>
          <DialogContent sx={{ px: 4, py: 3 }}>
            {modalError && <Alert severity="error" sx={{ mb: 2 }}>{modalError}</Alert>}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Input label="Nombre" placeholder="Ej. María" {...createForm.register('name')} error={!!createForm.formState.errors.name} helperText={createForm.formState.errors.name?.message} required />
                <Input label="Apellido" placeholder="Ej. García" {...createForm.register('lastName')} error={!!createForm.formState.errors.lastName} helperText={createForm.formState.errors.lastName?.message} required />
              </Box>
              <Input label="Nombre de Usuario" placeholder="Ej. maria.garcia" {...createForm.register('userName')} error={!!createForm.formState.errors.userName} helperText={createForm.formState.errors.userName?.message} required />
              <Input label="Email" placeholder="maria@ejemplo.com" type="email" {...createForm.register('email')} error={!!createForm.formState.errors.email} helperText={createForm.formState.errors.email?.message} required />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Input label="Contraseña" type="password" placeholder="••••••••" {...createForm.register('password')} error={!!createForm.formState.errors.password} helperText={createForm.formState.errors.password?.message} required />
                <Input label="Confirmar Contraseña" type="password" placeholder="••••••••" {...createForm.register('confirmPassword')} error={!!createForm.formState.errors.confirmPassword} helperText={createForm.formState.errors.confirmPassword?.message} required />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 4, py: 2, gap: 1, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'rgba(189, 191, 220, 0.12)' }}>
            <Button onClick={closeModal} variant="outlined" color="inherit" disabled={submitting}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary" isLoading={submitting}>Crear Subcuenta</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── Edit Modal ── */}
      <Dialog open={modalMode !== null && modalMode !== 'create'} onClose={closeModal} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: '12px' } } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.1rem', borderBottom: '1px solid', borderColor: 'divider', px: 4, py: 2.5 }}>
          Editar Subcuenta
        </DialogTitle>
        <form onSubmit={editForm.handleSubmit(handleEdit)}>
          <DialogContent sx={{ px: 4, py: 3 }}>
            {modalError && <Alert severity="error" sx={{ mb: 2 }}>{modalError}</Alert>}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Input label="Nombre" placeholder="Ej. María" {...editForm.register('name')} error={!!editForm.formState.errors.name} helperText={editForm.formState.errors.name?.message} required />
                <Input label="Apellido" placeholder="Ej. García" {...editForm.register('lastName')} error={!!editForm.formState.errors.lastName} helperText={editForm.formState.errors.lastName?.message} required />
              </Box>
              <Input label="Email" placeholder="maria@ejemplo.com" type="email" {...editForm.register('email')} error={!!editForm.formState.errors.email} helperText={editForm.formState.errors.email?.message} required />
              <FormControlLabel
                control={<Checkbox {...editForm.register('active')} defaultChecked />}
                label="Activa"
                sx={{ '& .MuiTypography-root': { fontWeight: 500, fontSize: '14px' } }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 4, py: 2, gap: 1, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'rgba(189, 191, 220, 0.12)' }}>
            <Button onClick={closeModal} variant="outlined" color="inherit" disabled={submitting}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary" isLoading={submitting}>Guardar Cambios</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
