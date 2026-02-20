/**
 * Home Page
 * Página principal (vacía por ahora)
 */

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/shared/Header';

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
    <Box>
      <Header />
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      )}
      {/* Contenido principal vacío - será llenado más adelante */}
    </Box>
  );
}
