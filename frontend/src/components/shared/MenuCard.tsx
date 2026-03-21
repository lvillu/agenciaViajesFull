/**
 * MenuCard Component
 * Tarjeta de navegación para el menú principal
 */

'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useRouter } from 'next/navigation';

interface MenuCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  actionLabel: string;
}

export const MenuCard: React.FC<MenuCardProps> = ({ title, description, icon, href, actionLabel }) => {
  const router = useRouter();

  return (
    <Box
      onClick={() => router.push(href)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        p: 4,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          transform: 'translateY(-2px)',
          '& .menu-card-icon': {
            bgcolor: 'primary.main',
            color: '#fff',
          },
          '& .menu-card-action': {
            opacity: 1,
          },
        },
      }}
    >
      <Box
        className="menu-card-icon"
        sx={{
          width: 56,
          height: 56,
          borderRadius: 2,
          bgcolor: 'primary.light',
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          transition: 'all 0.2s ease-in-out',
        }}
      >
        {icon}
      </Box>
      <Typography variant="h4" sx={{ mb: 1, color: 'text.primary' }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 2 }}>
        {description}
      </Typography>
      <Box
        className="menu-card-action"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          color: 'primary.main',
          fontSize: '14px',
          fontWeight: 700,
          opacity: 0,
          transition: 'opacity 0.2s ease-in-out',
          mt: 'auto',
        }}
      >
        {actionLabel} <ArrowForwardIcon sx={{ fontSize: 16 }} />
      </Box>
    </Box>
  );
};
