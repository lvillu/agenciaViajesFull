/**
 * SignUp Page
 * Página de creación de nueva cuenta
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
  Grid,
} from '@mui/material';
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
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          py: 4,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h2" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
            Crear Cuenta
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: '#666' }}>
            Únete a Agencia Viajes
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
              sx={{ mt: 3, mb: 2 }}
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
                sx={{ cursor: 'pointer', fontWeight: 'bold', color: '#1976d2' }}
              >
                Inicia sesión
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
