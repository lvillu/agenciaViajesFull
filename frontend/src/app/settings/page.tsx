/**
 * Settings Page
 * Página de configuración del usuario y vista de información
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useAgencyInfo } from '@/hooks/useAgencyInfo';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { UpdateAgencyInfoRequest } from '@/types/agencyInfo';

const AgencyInfoSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().max(10, 'Máximo 10 caracteres').optional(),
  phone: z.string().max(20, 'Máximo 20 caracteres').optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  secturReg: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  logoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
});

type AgencyInfoFormData = z.infer<typeof AgencyInfoSchema>;

export default function SettingsPage() {
  const { user, loading, error, fetchUserInfo, isAuthenticated } = useAuth();
  const hasFetchedUser = useRef(false);
  const {
    agencyInfo,
    loading: loadingAgency,
    error: errorAgency,
    fetchAgencyInfo,
    updateAgencyInfo,
  } = useAgencyInfo();
  const hasFetchedAgency = useRef(false);

  const [agencySaveSuccess, setAgencySaveSuccess] = useState(false);
  const [agencySaveError, setAgencySaveError] = useState<string | null>(null);
  const [savingAgency, setSavingAgency] = useState(false);

  const {
    register: registerAgency,
    handleSubmit: handleSubmitAgency,
    reset: resetAgencyForm,
    formState: { errors: agencyErrors },
  } = useForm<AgencyInfoFormData>({
    resolver: zodResolver(AgencyInfoSchema),
    defaultValues: { name: '' },
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
    if (isAuthenticated && !hasFetchedAgency.current) {
      hasFetchedAgency.current = true;
      fetchAgencyInfo();
    }
  }, [isAuthenticated, fetchAgencyInfo]);

  // Pre-fill agency form when data loads
  useEffect(() => {
    if (agencyInfo) {
      resetAgencyForm({
        name: agencyInfo.name,
        address: agencyInfo.address ?? '',
        city: agencyInfo.city ?? '',
        state: agencyInfo.state ?? '',
        zipCode: agencyInfo.zipCode ?? '',
        phone: agencyInfo.phone ?? '',
        email: agencyInfo.email ?? '',
        secturReg: agencyInfo.secturReg ?? '',
        facebook: agencyInfo.facebook ?? '',
        instagram: agencyInfo.instagram ?? '',
        logoUrl: agencyInfo.logoUrl ?? '',
      });
    }
  }, [agencyInfo, resetAgencyForm]);

  const onSubmitAgency = async (data: AgencyInfoFormData) => {
    setAgencySaveError(null);
    setAgencySaveSuccess(false);
    setSavingAgency(true);
    try {
      const request: UpdateAgencyInfoRequest = {
        name: data.name,
        address: data.address || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        zipCode: data.zipCode || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        secturReg: data.secturReg || undefined,
        facebook: data.facebook || undefined,
        instagram: data.instagram || undefined,
        logoUrl: data.logoUrl || undefined,
      };
      await updateAgencyInfo(request);
      setAgencySaveSuccess(true);
    } catch (err: any) {
      setAgencySaveError(err.message || 'Error al guardar información de la agencia');
    } finally {
      setSavingAgency(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Header />
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, lg: 4 } }}>
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Box sx={{ flex: 1 }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}>

          {/* ── Mi Perfil ── */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              maxWidth: 800,
              mb: 4,
            }}
          >
            <Typography variant="h1" sx={{ mb: 4, fontWeight: 800 }}>
              Mi Perfil
            </Typography>

          {user && (
            <Grid container spacing={3}>
              {/* Avatar y Información Principal */}
              <Grid size={{ xs: 12, sm: "auto" }}>
                <Avatar
                  src={user.userIconUrl || undefined}
                  alt={user.fullName}
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: user.userIconUrl ? 'transparent' : 'primary.light',
                    color: 'primary.main',
                    fontSize: '3rem',
                  }}
                >
                  {!user.userIconUrl && user.fullName.charAt(0).toUpperCase()}
                </Avatar>
              </Grid>

              {/* Detalles del Usuario */}
              <Grid size={{ xs: 12, sm: 'auto' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                  <Typography variant="h3" sx={{ mb: 1 }}>
                    {user.fullName}
                  </Typography>
                  <Typography variant="body1" color="textSecondary" sx={{ mb: 1 }}>
                    @{user.userName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {user.email}
                  </Typography>
                </Box>
              </Grid>

              {/* Información Detallada */}
              <Grid size={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Información de Cuenta
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                        NOMBRE COMPLETO
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5 }}>
                        {user.fullName}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                        USUARIO
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5 }}>
                        @{user.userName}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                        EMAIL
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5 }}>
                        {user.email}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                        FOTO DE PERFIL
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5 }}>
                        {user.userIconUrl ? 'Configurada' : 'Sin configurar'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </Paper>

          {/* ── Información de la Agencia ── */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              maxWidth: 800,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
              <Box
                sx={{
                  p: 1,
                  bgcolor: 'rgba(236, 91, 19, 0.1)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#ec5b13',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px', lineHeight: 1 }}>
                  travel_explore
                </span>
              </Box>
              <Typography variant="h2" sx={{ fontWeight: 800 }}>
                Información de la Agencia
              </Typography>
            </Box>

            {errorAgency && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                {errorAgency === 'Error al obtener información de la agencia' ||
                errorAgency === 'No se ha configurado la información de la agencia'
                  ? 'No hay información de agencia registrada aún. Completa el formulario para crearla.'
                  : errorAgency}
              </Alert>
            )}

            {agencySaveSuccess && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Información de la agencia guardada correctamente.
              </Alert>
            )}

            {agencySaveError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {agencySaveError}
              </Alert>
            )}

            {loadingAgency ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress sx={{ color: '#ec5b13' }} />
              </Box>
            ) : (
              <form onSubmit={handleSubmitAgency(onSubmitAgency)}>
                <Grid container spacing={2.5}>
                  <Grid size={12}>
                    <Input
                      label="Nombre de la Agencia *"
                      {...registerAgency('name')}
                      error={!!agencyErrors.name}
                      helperText={agencyErrors.name?.message}
                    />
                  </Grid>

                  <Grid size={12}>
                    <Input
                      label="Dirección"
                      {...registerAgency('address')}
                      error={!!agencyErrors.address}
                      helperText={agencyErrors.address?.message}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Input
                      label="Ciudad"
                      {...registerAgency('city')}
                      error={!!agencyErrors.city}
                      helperText={agencyErrors.city?.message}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Input
                      label="Estado"
                      {...registerAgency('state')}
                      error={!!agencyErrors.state}
                      helperText={agencyErrors.state?.message}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 2 }}>
                    <Input
                      label="C.P."
                      {...registerAgency('zipCode')}
                      error={!!agencyErrors.zipCode}
                      helperText={agencyErrors.zipCode?.message}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Input
                      label="Teléfono"
                      {...registerAgency('phone')}
                      error={!!agencyErrors.phone}
                      helperText={agencyErrors.phone?.message}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Input
                      label="Email"
                      type="email"
                      {...registerAgency('email')}
                      error={!!agencyErrors.email}
                      helperText={agencyErrors.email?.message}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Input
                      label="Registro SECTUR"
                      {...registerAgency('secturReg')}
                      error={!!agencyErrors.secturReg}
                      helperText={agencyErrors.secturReg?.message || 'Ej. 04190060827'}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Input
                      label="URL del Logo (opcional)"
                      {...registerAgency('logoUrl')}
                      error={!!agencyErrors.logoUrl}
                      helperText={agencyErrors.logoUrl?.message}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Input
                      label="Facebook"
                      {...registerAgency('facebook')}
                      error={!!agencyErrors.facebook}
                      helperText={agencyErrors.facebook?.message}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Input
                      label="Instagram"
                      {...registerAgency('instagram')}
                      error={!!agencyErrors.instagram}
                      helperText={agencyErrors.instagram?.message}
                    />
                  </Grid>

                  <Grid size={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={savingAgency}
                        startIcon={
                          savingAgency ? undefined : (
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                              save
                            </span>
                          )
                        }
                      >
                        {savingAgency ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Guardar Cambios'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            )}
          </Paper>

        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
