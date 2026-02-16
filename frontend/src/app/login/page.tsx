/**
 * Login Page
 * Página de inicio de sesión
 */

'use client';

import React, { useState } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Link as MuiLink,
  Alert,
} from '@mui/material';
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
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper elevation={0} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h2" sx={{ mb: 3, textAlign: 'center' }}>
            Iniciar Sesión
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
            Agencia Viajes
          </Typography>

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
              sx={{ mb: 2 }}
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
                sx={{ cursor: 'pointer', fontWeight: 600, color: 'primary.main' }}
              >
                Crear cuenta
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
