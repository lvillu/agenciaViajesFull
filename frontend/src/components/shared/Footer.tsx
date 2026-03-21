/**
 * Footer Component
 * Barra inferior con branding y links
 */

'use client';

import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';

export const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        py: 4,
        mt: 'auto',
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          px: { xs: 2, sm: 3, lg: 4 },
        }}
      >
        {/* Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FlightTakeoffIcon sx={{ color: 'primary.main', fontSize: 22 }} />
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Agencia Viajes
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            © 2024 Management Suite
          </Typography>
        </Box>

        {/* Links */}
        <Box sx={{ display: 'flex', gap: 3 }}>
          {['Términos', 'Privacidad', 'Soporte Técnico'].map((label) => (
            <Link
              key={label}
              href="#"
              underline="none"
              variant="body2"
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' },
                transition: 'color 0.2s',
              }}
            >
              {label}
            </Link>
          ))}
        </Box>
      </Container>
    </Box>
  );
};
