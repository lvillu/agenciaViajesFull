/**
 * MenuCard Component
 * Tarjeta de navegación para el menú principal
 */

'use client';

import React from 'react';
import { Card, CardContent, Typography, Avatar } from '@mui/material';
import { useRouter } from 'next/navigation';

interface MenuCardProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  href: string;
}

export const MenuCard: React.FC<MenuCardProps> = ({ title, icon, color, href }) => {
  const router = useRouter();

  return (
    <Card
      elevation={0}
      onClick={() => router.push(href)}
      sx={{
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        bgcolor: color,
        color: '#FFFFFF',
        '&:hover': {
          boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '140px',
          gap: 2,
        }}
      >
        <Avatar
          sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            width: 56,
            height: 56,
          }}
        >
          {icon}
        </Avatar>
        <Typography variant="h3" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};
