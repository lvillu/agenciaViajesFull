/**
 * SubAccounts Page
 * Página de gestión de subcuentas — solo visible para el titular de la cuenta
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useSubAccounts } from '@/hooks/useSubAccounts';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const createSubAccountSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  lastName: z.string().min(1, 'El apellido es requerido').max(100, 'Máximo 100 caracteres'),
  userName: z.string().min(1, 'El usuario es requerido').max(50, 'Máximo 50 caracteres'),
  email: z.string().min(1, 'El email es requerido').email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),
  confirmPassword: z.string().min(1, 'Confirma la contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type CreateSubAccountFormData = z.infer<typeof createSubAccountSchema>;

export default function SubAccountsPage() {
  const { user, isAuthenticated, fetchUserInfo } = useAuth();
  const hasFetchedUser = useRef(false);
  const {
    subAccounts,
    loading,
    error,
    fetchSubAccounts,
    createSubAccount,
    deleteSubAccount,
  } = useSubAccounts();

  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSubAccountFormData>({
    resolver: zodResolver(createSubAccountSchema),
    defaultValues: {
      name: '',
      lastName: '',
      userName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (isAuthenticated && !user && !hasFetchedUser.current) {
      hasFetchedUser.current = true;
      fetchUserInfo().catch(() => {
        hasFetchedUser.current = false;
      });
    }
  }, [isAuthenticated, user, fetchUserInfo]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubAccounts();
    }
  }, [isAuthenticated, fetchSubAccounts]);

  const handleOpenModal = () => {
    setCreateError(null);
    reset();
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleCreateSubAccount = async (data: CreateSubAccountFormData) => {
    setCreateError(null);
    setCreating(true);
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
        handleCloseModal();
      } else {
        // Error is set by the hook
      }
    } catch (err: any) {
      setCreateError(err.message || 'Error al crear subcuenta');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSubAccount = async (id: number, userName: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar la subcuenta "${userName}"?`)) {
      return;
    }
    setDeleteError(null);
    const success = await deleteSubAccount(id);
    if (!success) {
      setDeleteError('Error al eliminar la subcuenta');
    }
  };

  const isOwner = user?.role === 'owner';

  if (loading && !isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Box sx={{ flex: 1 }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}>
          {/* Page Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
            <Box
              sx={{
                p: 1,
                bgcolor: 'rgba(91, 169, 179, 0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                color: '#5BA9B3',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px', lineHeight: 1 }}>
                groups
              </span>
            </Box>
            <Typography variant="h2" sx={{ fontWeight: 800 }}>
              Subcuentas
            </Typography>
          </Box>

          {deleteError && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setDeleteError(null)}>
              {deleteError}
            </Alert>
          )}

          {!isOwner ? (
            /* ── Sub-account view ── */
            <Paper
              elevation={0}
              sx={{
                p: 6,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                textAlign: 'center',
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'rgba(91, 169, 179, 0.1)',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  color: '#5BA9B3',
                  mb: 2,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '40px', lineHeight: 1 }}>
                  info
                </span>
              </Box>
              <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
                Acceso restringido
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Solo el titular de la cuenta puede gestionar las subcuentas.
              </Typography>
            </Paper>
          ) : (
            /* ── Owner view ── */
            <>
              {/* Top Actions */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenModal}
                  startIcon={
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      person_add
                    </span>
                  }
                >
                  Agregar Subcuenta
                </Button>
              </Box>

              {/* Error */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {/* Sub-accounts Table */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'hidden',
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress sx={{ color: 'primary.main' }} />
                  </Box>
                ) : subAccounts.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                      No hay subcuentas registradas
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      Crea una subcuenta para que otro usuario pueda acceder a la misma información.
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Nombre</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Usuario</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Estado</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }} align="center">Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {subAccounts.map((sub) => (
                          <TableRow
                            key={sub.id}
                            sx={{
                              '&:hover': { bgcolor: 'rgba(189, 191, 220, 0.08)' },
                            }}
                          >
                            <TableCell>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {sub.name} {sub.lastName}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                @{sub.userName}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{sub.email}</Typography>
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  display: 'inline-flex',
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: '12px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  bgcolor: sub.active ? 'rgba(22, 163, 74, 0.1)' : 'rgba(189, 191, 220, 0.2)',
                                  color: sub.active ? '#16a34a' : 'text.disabled',
                                }}
                              >
                                {sub.active ? 'Activa' : 'Inactiva'}
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteSubAccount(sub.id, sub.userName)}
                                sx={{
                                  color: 'text.disabled',
                                  '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.08)' },
                                }}
                                title="Eliminar subcuenta"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                  delete
                                </span>
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </>
          )}
        </Container>
      </Box>
      <Footer />

      {/* ── Create Sub-Account Modal ── */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '12px',
              border: '1px solid',
              borderColor: 'divider',
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            px: 4,
            py: 2.5,
            fontWeight: 800,
            fontSize: '1.1rem',
            borderBottom: '1px solid',
            borderColor: 'divider',
            pr: 6,
          }}
        >
          Agregar Subcuenta
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              right: 12,
              top: 12,
              color: 'text.secondary',
              '&:hover': { bgcolor: 'rgba(189, 191, 220, 0.2)' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSubmit(handleCreateSubAccount)}>
          <DialogContent sx={{ px: 4, py: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {createError && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {createError}
                </Alert>
              )}

              {/* Nombre + Apellido */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Input
                  label="Nombre"
                  placeholder="Ej. María"
                  {...register('name')}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  required
                />
                <Input
                  label="Apellido"
                  placeholder="Ej. García"
                  {...register('lastName')}
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                  required
                />
              </Box>

              {/* Usuario */}
              <Input
                label="Nombre de Usuario"
                placeholder="Ej. maria.garcia"
                {...register('userName')}
                error={!!errors.userName}
                helperText={errors.userName?.message}
                required
              />

              {/* Email */}
              <Input
                label="Email"
                placeholder="maria@ejemplo.com"
                type="email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                required
              />

              {/* Contraseña + Confirmar */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  required
                />
                <Input
                  label="Confirmar Contraseña"
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  required
                />
              </Box>
            </Box>
          </DialogContent>

          <DialogActions
            sx={{
              px: 4,
              py: 2,
              gap: 1,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'rgba(189, 191, 220, 0.12)',
            }}
          >
            <Button
              onClick={handleCloseModal}
              variant="outlined"
              color="inherit"
              disabled={creating}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              isLoading={creating}
            >
              Crear Subcuenta
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
