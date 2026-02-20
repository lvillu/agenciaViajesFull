/**
 * Clientes Page
 * Gestión de clientes
 */

'use client';

import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import { Header } from '@/components/shared/Header';

export default function ClientesPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h1" sx={{ mb: 3, color: 'text.primary' }}>
          Clientes
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Módulo en construcción...
        </Typography>
      </Container>
    </Box>
  );
}
