/**
 * SignUp Page
 * Página de creación de nueva cuenta
 */

'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Link as MuiLink,
  Alert,
  Grid,
} from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { signupSchema, type SignUpFormData } from '@/lib/validationSchemas';
import { useAuth } from '@/hooks/useAuth';

export default function SignUpPage() {
  const router = useRouter();
  const { signup, loading, error } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    setSubmitError(null);
    try {
      await signup(data);
      router.push('/');
    } catch (err: any) {
      setSubmitError(err.message || 'Error al crear usuario');
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
        py: 4,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 480 }}>
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
            Crear Cuenta
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Únete a Agencia Viajes
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
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Input
                  label="Nombre"
                  placeholder="Tu nombre"
                  {...register('name')}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  autoComplete="given-name"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Input
                  label="Apellido"
                  placeholder="Tu apellido"
                  {...register('lastName')}
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                  autoComplete="family-name"
                />
              </Grid>

              <Grid item xs={12}>
                <Input
                  label="Usuario"
                  placeholder="Nombre de usuario único"
                  {...register('userName')}
                  error={!!errors.userName}
                  helperText={errors.userName?.message}
                  autoComplete="username"
                />
              </Grid>

              <Grid item xs={12}>
                <Input
                  label="Email"
                  type="email"
                  placeholder="Tu email"
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  autoComplete="email"
                />
              </Grid>

              <Grid item xs={12}>
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="Tu contraseña"
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  autoComplete="new-password"
                />
              </Grid>

              <Grid item xs={12}>
                <Input
                  label="Confirmar Contraseña"
                  type="password"
                  placeholder="Confirma tu contraseña"
                  {...register('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  autoComplete="new-password"
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              isLoading={loading}
              sx={{ mt: 3, mb: 2, height: 48 }}
            >
              Crear Cuenta
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              ¿Ya tienes cuenta?{' '}
              <MuiLink
                href="/login"
                underline="hover"
                sx={{ cursor: 'pointer', fontWeight: 700, color: 'primary.main' }}
              >
                Inicia sesión
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
