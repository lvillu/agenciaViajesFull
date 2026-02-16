/**
 * Settings Page
 * Página de configuración del usuario y vista de información
 */

'use client';

import React, { useEffect } from 'react';
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

export default function SettingsPage() {
  const { user, loading, error, fetchUserInfo, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchUserInfo();
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
        <Container maxWidth="md">
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <Header />
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: 4, bgcolor: 'background.paper' }}>
          <Typography variant="h2" sx={{ mb: 3 }}>
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
                    bgcolor: user.userIconUrl ? 'transparent' : 'primary.main',
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
  );
}
