/**
 * Dashboard Page
 * Panel de control y estadísticas
 */

'use client';

import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

export default function DashboardPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Box sx={{ flex: 1 }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}>
          <Breadcrumbs items={[{ label: 'Dashboard' }]} />
          <Typography variant="h1" sx={{ mb: 1, fontWeight: 800, color: 'text.primary' }}>
            Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Módulo en construcción...
          </Typography>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
