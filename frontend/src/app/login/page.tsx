/**
 * Login Page
 * Página de inicio de sesión
 */

'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Link as MuiLink,
  Alert,
} from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { loginSchema, type LoginFormData } from '@/lib/validationSchemas';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null);
    try {
      await login(data);
      router.push('/');
    } catch (err: any) {
      setSubmitError(err.message || 'Error al iniciar sesión');
    }
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        {/* Brand Header */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: 'primary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <FlightTakeoffIcon sx={{ color: 'primary.main', fontSize: 28 }} />
          </Box>
          <Typography variant="h2" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
            Agencia Viajes
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Inicia sesión para continuar
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ mb: 2 }}>
              <Input
                label="Usuario"
                placeholder="Tu usuario"
                {...register('userName')}
                error={!!errors.userName}
                helperText={errors.userName?.message}
                autoComplete="username"
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Input
                label="Contraseña"
                type="password"
                placeholder="Tu contraseña"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                autoComplete="current-password"
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              isLoading={loading}
              sx={{ mb: 2, height: 48 }}
            >
              Iniciar Sesión
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              ¿No tienes cuenta?{' '}
              <MuiLink
                href="/signup"
                underline="hover"
                sx={{ cursor: 'pointer', fontWeight: 700, color: 'primary.main' }}
              >
                Crear cuenta
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
