/**
 * SignUp Page
 * Página de creación de nueva cuenta — diseño split-screen
 */

'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Link as MuiLink,
  Alert,
  Grid,
  Checkbox,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { signupSchema, type SignUpFormData } from '@/lib/validationSchemas';
import { useAuth } from '@/hooks/useAuth';

const ICON_STYLE: React.CSSProperties = {
  fontFamily: '"Material Symbols Outlined"',
  fontWeight: 'normal',
  fontStyle: 'normal',
  fontSize: '20px',
  lineHeight: 1,
  letterSpacing: 'normal',
  textTransform: 'none',
  display: 'inline-block',
  whiteSpace: 'nowrap',
  wordWrap: 'normal',
  color: '#94a3b8',
  userSelect: 'none',
};

export default function SignUpPage() {
  const router = useRouter();
  const { signup, loading, error } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

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
    <Box sx={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>

      {/* ── Left Panel: Travel Photo ── */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          width: '50%',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {/* Background image */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDNkc0mpOwkW6i48WA2rkInDTwf7ZP0RrKckV0t_3ZP2GCx-LzKKQt63fACgV-w_hho2XoJ2Juj-D8ZQ086seX8R3xWb2srH-oAzoQU0ooubbZeJQH5dRLKzikJ8q6DZdGUXqOqxQtOziVsRHr9Ut5l9o9rYLjICtNmfpdhGWHZwYESimW3qe8ODoz27j0Z4xWaoBYtH5phNoHD4uBe6ees8Y1w1b4ApENru1z0JSUdwPppPOAnAew7h0ynSDquLYBNyUznKGV09BM')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Dark gradient overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)',
          }}
        />

        {/* Logo — top left */}
        <Box
          sx={{
            position: 'absolute',
            top: 40,
            left: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(12px)',
            px: 2,
            py: 1,
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <span style={{ ...ICON_STYLE, color: '#5BA9B3', fontSize: '22px' }}>explore</span>
          <Typography
            sx={{ fontWeight: 700, color: '#ffffff', fontSize: '15px', letterSpacing: '-0.02em' }}
          >
            Agencia Viajes
          </Typography>
        </Box>

        {/* Hero text — bottom */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 48,
            left: 48,
            right: 48,
            color: '#ffffff',
          }}
        >
          <Typography
            sx={{
              fontSize: { lg: '34px', xl: '40px' },
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              mb: 2,
            }}
          >
            Descubre los destinos más increíbles del mundo.
          </Typography>
          <Typography sx={{ fontSize: '16px', fontWeight: 500, opacity: 0.88, maxWidth: '380px' }}>
            Más de 2 millones de viajeros exploran destinos únicos cada día.
          </Typography>
        </Box>
      </Box>

      {/* ── Right Panel: Form ── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 3, sm: 6, md: 10, lg: 8, xl: 14 },
          py: 6,
          bgcolor: '#ffffff',
          overflowY: 'auto',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 480 }}>

          {/* Mobile-only logo */}
          <Box
            sx={{
              display: { xs: 'flex', lg: 'none' },
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1,
              mb: 5,
            }}
          >
            <span style={{ ...ICON_STYLE, color: '#5BA9B3', fontSize: '30px' }}>explore</span>
            <Typography
              sx={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', color: '#525252' }}
            >
              Agencia Viajes
            </Typography>
          </Box>

          {/* Heading */}
          <Box sx={{ mb: 5, textAlign: { xs: 'center', lg: 'left' } }}>
            <Typography
              sx={{ fontSize: '28px', fontWeight: 700, color: '#525252', mb: 0.75, letterSpacing: '-0.02em' }}
            >
              Crear Cuenta
            </Typography>
            <Typography sx={{ fontSize: '14px', color: '#8B8DA8' }}>
              Comienza tu viaje completando tus datos a continuación.
            </Typography>
          </Box>

          {/* Alerts */}
          {submitError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {submitError}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>

              {/* Nombre + Apellido */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Input
                  label="Nombre"
                  InputProps={{
                    startAdornment: <span style={ICON_STYLE}>person</span>,
                  }}
                  {...register('name')}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  autoComplete="given-name"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Input
                  label="Apellido"
                  {...register('lastName')}
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                  autoComplete="family-name"
                />
              </Grid>

              {/* Usuario */}
              <Grid size={12}>
                <Input
                  label="Usuario"
                  InputProps={{
                    startAdornment: <span style={ICON_STYLE}>alternate_email</span>,
                  }}
                  {...register('userName')}
                  error={!!errors.userName}
                  helperText={errors.userName?.message}
                  autoComplete="username"
                />
              </Grid>

              {/* Email */}
              <Grid size={12}>
                <Input
                  label="Correo Electrónico"
                  type="email"
                  placeholder="john@example.com"
                  InputProps={{
                    startAdornment: <span style={ICON_STYLE}>mail</span>,
                  }}
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  autoComplete="email"
                />
              </Grid>

              {/* Contraseña + Confirmar */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Input
                  label="Contraseña"
                  type="password"
                  InputProps={{
                    startAdornment: <span style={ICON_STYLE}>lock</span>,
                  }}
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  autoComplete="new-password"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Input
                  label="Confirmar"
                  type="password"
                  {...register('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  autoComplete="new-password"
                />
              </Grid>
            </Grid>

            {/* Terms */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2.5 }}>
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                size="small"
                sx={{
                  p: 0,
                  color: '#D8DAEA',
                  '&.Mui-checked': { color: '#5BA9B3' },
                }}
              />
              <Typography
                component="label"
                htmlFor="terms"
                sx={{ fontSize: '13px', color: '#8B8DA8', cursor: 'pointer', lineHeight: 1.4 }}
              >
                Acepto los{' '}
                <MuiLink href="#" underline="hover" sx={{ color: '#5BA9B3', fontWeight: 600 }}>
                  Términos de Servicio
                </MuiLink>{' '}
                y la{' '}
                <MuiLink href="#" underline="hover" sx={{ color: '#5BA9B3', fontWeight: 600 }}>
                  Política de Privacidad
                </MuiLink>
              </Typography>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              isLoading={loading}
              sx={{ mt: 3, height: 52, fontSize: '15px', fontWeight: 700 }}
            >
              Crear Cuenta
            </Button>
          </form>

          {/* Login link */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography sx={{ fontSize: '13px', color: '#8B8DA8' }}>
              ¿Ya tienes cuenta?{' '}
              <MuiLink
                href="/login"
                underline="hover"
                sx={{ cursor: 'pointer', fontWeight: 700, color: '#5BA9B3', ml: 0.5 }}
              >
                Iniciar Sesión
              </MuiLink>
            </Typography>
          </Box>

          {/* Social login */}
          <Box
            sx={{
              mt: 4,
              pt: 4,
              borderTop: '1px solid #D8DAEA',
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            {/* Google */}
            <Box
              component="button"
              type="button"
              sx={{
                width: 44,
                height: 44,
                p: 0,
                bgcolor: '#ffffff',
                borderRadius: '50%',
                border: '1px solid #D8DAEA',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s',
                '&:hover': { bgcolor: 'rgba(189, 191, 220, 0.15)' },
              }}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.908 3.152-1.928 4.176-1.02 1.024-2.42 1.744-4.8 1.744-3.88 0-6.956-3.136-6.956-7.016s3.076-7.016 6.956-7.016c2.1 0 3.66.832 4.716 1.812l2.316-2.316c-1.92-1.84-4.396-3.132-7.032-3.132-5.788 0-10.428 4.64-10.428 10.428s4.64 10.428 10.428 10.428c3.116 0 5.472-1.028 7.304-2.94 1.884-1.884 2.484-4.524 2.484-6.728 0-.648-.048-1.284-.132-1.872h-9.66z" />
              </svg>
            </Box>

            {/* Facebook */}
            <Box
              component="button"
              type="button"
              sx={{
                width: 44,
                height: 44,
                p: 0,
                bgcolor: '#ffffff',
                borderRadius: '50%',
                border: '1px solid #D8DAEA',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s',
                color: '#1877F2',
                '&:hover': { bgcolor: 'rgba(189, 191, 220, 0.15)' },
              }}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </Box>
          </Box>

        </Box>
      </Box>
    </Box>
  );
}
