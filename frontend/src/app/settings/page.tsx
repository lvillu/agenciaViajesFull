/**
 * Settings Page
 * Página de configuración del usuario y vista de información
 */

'use client';

import React, { useEffect, useRef } from 'react';
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
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';

export default function SettingsPage() {
  const { user, loading, error, fetchUserInfo, isAuthenticated } = useAuth();
  const hasFetchedUser = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !user && !hasFetchedUser.current) {
      hasFetchedUser.current = true;
      fetchUserInfo().catch(() => {
        hasFetchedUser.current = false; // Permitir reintentar si falla
      });
    }
  }, [isAuthenticated, user, fetchUserInfo]);

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
            <Typography variant="h1" sx={{ mb: 4, fontWeight: 800 }}>
              Mi Perfil
            </Typography>

          {user && (
            <Grid container spacing={3}>
              {/* Avatar y Información Principal */}
              <Grid item xs={12} sm="auto">
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
              <Grid item xs={12} sm>
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
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Información de Cuenta
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                        NOMBRE COMPLETO
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5 }}>
                        {user.fullName}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                        USUARIO
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5 }}>
                        @{user.userName}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                        EMAIL
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5 }}>
                        {user.email}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
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
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
