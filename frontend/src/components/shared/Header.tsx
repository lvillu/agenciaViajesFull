/**
 * Header Component
 * Barra de navegación superior con información del usuario
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
} from '@mui/material';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useAuth } from '@/hooks/useAuth';

export const Header: React.FC = () => {
  const router = useRouter();
  const { userName, user } = useAuthStore();
  const { logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSettings = () => {
    handleMenuClose();
    router.push('/settings');
  };

  const handleLogout = async () => {
    handleMenuClose();
    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que deseas cerrar sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2F80ED',
      cancelButtonColor: '#EB5757',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      await logout();
      router.push('/login');
    }
  };

  if (!mounted) return null;

  return (
    <AppBar position="static" sx={{ mb: 4 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
          onClick={() => router.push('/')}
        >
          Agencia Viajes
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {user && (
            <Typography variant="body2">
              {user.fullName || userName}
            </Typography>
          )}
          <IconButton
            onClick={handleMenuOpen}
            sx={{
              p: 0,
              width: 40,
              height: 40,
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
                cursor: 'pointer',
              }}
              src={user?.userIconUrl || undefined}
              alt={userName || 'Usuario'}
            >
              {!user?.userIconUrl && userName?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleSettings}>
            ⚙️ Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            🚪 Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};
