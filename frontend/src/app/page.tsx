/**
 * Home Page
 * Página principal con menú de navegación
 */

'use client';

import React, { useEffect, useState, useRef, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Container, Grid, Typography } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { MenuCard } from '@/components/shared/MenuCard';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { fetchUserInfo } = useAuth();
  const [loading, setLoading] = useState(true);
  const hasFetchedUser = useRef(false);
  // Deteccion de montaje sin estado ni efecto: evita mismatch de hidratacion
  // y el setState sincrono en efecto (react-hooks/set-state-in-effect).
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!hasFetchedUser.current) {
      hasFetchedUser.current = true;
      setLoading(true);
      fetchUserInfo()
        .catch((err) => {
          console.error('Error al cargar información del usuario:', err);
          hasFetchedUser.current = false;
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [mounted, isAuthenticated, router, fetchUserInfo]);

  if (!mounted || !isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Container maxWidth="xl" sx={{ py: 6, flex: 1, px: { xs: 2, sm: 3, lg: 4 } }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 6 }}>
              <Typography variant="h1" sx={{ mb: 1, color: 'text.primary' }}>
                Panel de Control
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Selecciona un módulo para comenzar a gestionar tu agencia de viajes.
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <MenuCard
                  title="Proveedores"
                  description="Gestiona tus socios comerciales, contratos y condiciones de pago."
                  icon={<HandshakeIcon sx={{ fontSize: 28 }} />}
                  href="/proveedores"
                  actionLabel="Ver Proveedores"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <MenuCard
                  title="Clientes"
                  description="Accede a la base de datos de viajeros, perfiles e historial de compras."
                  icon={<GroupsIcon sx={{ fontSize: 28 }} />}
                  href="/clientes"
                  actionLabel="Ver Directorio"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <MenuCard
                  title="Reservas"
                  description="Administra reservas, pagos y el estado de cada viaje."
                  icon={<ConfirmationNumberIcon sx={{ fontSize: 28 }} />}
                  href="/reservas"
                  actionLabel="Ver Reservas"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <MenuCard
                  title="Dashboard"
                  description="Visualiza estadísticas, reportes y métricas de rendimiento."
                  icon={<AnalyticsIcon sx={{ fontSize: 28 }} />}
                  href="/dashboard"
                  actionLabel="Ver Dashboard"
                />
              </Grid>
            </Grid>
          </>
        )}
      </Container>
      <Footer />
    </Box>
  );
}
