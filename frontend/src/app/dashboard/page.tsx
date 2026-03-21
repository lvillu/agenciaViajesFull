/**
 * Dashboard Page
 * Panel de control y estadísticas
 */

'use client';

import React from 'react';
import { Container, Box, Typography, Divider, IconButton, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { DashboardCards } from '@/components/features/dashboard/DashboardCards';
import { DashboardCharts } from '@/components/features/dashboard/DashboardCharts';
import { useDashboard } from '@/hooks/useDashboard';

export default function DashboardPage() {
  const {
    cards,
    monthlySalesChart,
    salesByProviderChart,
    monthlyProfitsChart,
    loading,
    error,
    refresh,
  } = useDashboard();

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Box sx={{ flex: 1 }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}>
          <Breadcrumbs items={[{ label: 'Dashboard' }]} />

          {/* Encabezado */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4 }}>
            <Box>
              <Typography variant="h1" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                Dashboard
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Resumen de actividad y métricas de la agencia
              </Typography>
            </Box>
            <Tooltip title="Actualizar datos">
              <IconButton
                onClick={refresh}
                disabled={loading}
                sx={{
                  mt: 0.5,
                  color: 'text.secondary',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  '&:hover': { color: 'primary.main', borderColor: 'primary.main' },
                }}
              >
                <RefreshIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Cards resumen */}
          <DashboardCards data={cards} loading={loading} error={error} />

          <Divider sx={{ my: 4, borderColor: '#e2e8f0' }} />

          {/* Gráficas */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h2" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
              Estadísticas
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Análisis de ventas y ganancias de los últimos 12 meses
            </Typography>
          </Box>

          <DashboardCharts
            monthlySales={monthlySalesChart}
            salesByProvider={salesByProviderChart}
            monthlyProfits={monthlyProfitsChart}
            loading={loading}
            error={error}
          />
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
