/**
 * Home Page
 * Página principal con menú de navegación
 */

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Container, Grid, Typography } from '@mui/material';
import {
  Store as StoreIcon,
  People as PeopleIcon,
  EventNote as EventNoteIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/shared/Header';
import { MenuCard } from '@/components/shared/MenuCard';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { fetchUserInfo } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const hasFetchedUser = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Cargar información del usuario solo una vez
    if (!hasFetchedUser.current) {
      hasFetchedUser.current = true;
      setLoading(true);
      fetchUserInfo()
        .catch((err) => {
          console.error('Error al cargar información del usuario:', err);
          hasFetchedUser.current = false; // Permitir reintentar si falla
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [mounted, isAuthenticated, router, fetchUserInfo]);

  if (!mounted || !isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="h1" sx={{ mb: 4, color: 'text.primary' }}>
              Menú Principal
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <MenuCard
                  title="Proveedores"
                  icon={<StoreIcon sx={{ fontSize: 28, color: '#FFFFFF' }} />}
                  color="#2F80ED"
                  href="/proveedores"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MenuCard
                  title="Clientes"
                  icon={<PeopleIcon sx={{ fontSize: 28, color: '#FFFFFF' }} />}
                  color="#00B4D8"
                  href="/clientes"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MenuCard
                  title="Reservas"
                  icon={<EventNoteIcon sx={{ fontSize: 28, color: '#FFFFFF' }} />}
                  color="#27AE60"
                  href="/reservas"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MenuCard
                  title="Dashboard"
                  icon={<DashboardIcon sx={{ fontSize: 28, color: '#FFFFFF' }} />}
                  color="#F2C94C"
                  href="/dashboard"
                />
              </Grid>
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
}
