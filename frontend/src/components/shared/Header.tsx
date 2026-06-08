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
  Badge,
  Tooltip,
  Container,
} from '@mui/material';
import Image from 'next/image';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useAuth } from '@/hooks/useAuth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

export const Header: React.FC = () => {
  const router = useRouter();
  const { userName, user, avatarVersion } = useAuthStore();
  const avatarUrl = user?.userIconUrl
    ? `${API_BASE_URL}${user.userIconUrl}${avatarVersion > 0 ? `?v=${avatarVersion}` : ''}`
    : undefined;
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

  const handleCuentas = () => {
    handleMenuClose();
    router.push('/cuentas');
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
      confirmButtonColor: '#ec5b13',
      cancelButtonColor: '#dc2626',
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
    <AppBar position="sticky">
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, sm: 3, lg: 4 } }}>
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64 }}>
          {/* Logo & Brand */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
            onClick={() => router.push('/')}
          >
            <Box sx={{ position: 'relative', width: 40, height: 32 }}>
              <Image
                src="/IbarraTravel_logo.png"
                alt="Ibarra Travel"
                fill
                priority
                sizes="40px"
                style={{ objectFit: 'contain' }}
              />
            </Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: 'text.primary', fontSize: '18px' }}
            >
              Ibarra Travel
            </Typography>
          </Box>

          {/* Actions & Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {/* Notifications */}
            <Tooltip title="Notificaciones">
              <IconButton sx={{ color: 'text.secondary' }}>
                <Badge color="primary" variant="dot">
                  <NotificationsOutlinedIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Divider */}
            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 1, height: 32, alignSelf: 'center', borderColor: 'divider' }}
            />

            {/* Profile */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                borderRadius: '9999px',
                px: 1,
                py: 0.5,
                '&:hover': { bgcolor: 'action.hover' },
                transition: 'background-color 0.2s',
              }}
              onClick={handleMenuOpen}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                  fontSize: '14px',
                  fontWeight: 700,
                  border: '1px solid',
                  borderColor: 'primary.light',
                }}
                src={avatarUrl}
                alt={userName || 'Usuario'}
              >
                {!avatarUrl && (userName?.charAt(0).toUpperCase() || 'U')}
              </Avatar>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: 'text.primary',
                  display: { xs: 'none', sm: 'block' },
                  pr: 0.5,
                }}
              >
                {user?.fullName || userName || 'Admin'}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </Container>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 200, borderRadius: 2 } } }}
      >
        {user?.role === 'owner' && (
          <MenuItem onClick={handleCuentas}>
            <ManageAccountsOutlinedIcon sx={{ mr: 1.5, fontSize: 20, color: 'text.secondary' }} />
            Cuentas
          </MenuItem>
        )}
        <MenuItem onClick={handleSettings}>
          <SettingsOutlinedIcon sx={{ mr: 1.5, fontSize: 20, color: 'text.secondary' }} />
          Configuración
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <LogoutOutlinedIcon sx={{ mr: 1.5, fontSize: 20 }} />
          Cerrar sesión
        </MenuItem>
      </Menu>
    </AppBar>
  );
};
