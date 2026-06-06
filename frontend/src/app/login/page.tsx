'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Link as MuiLink,
  Alert,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { loginSchema, type LoginFormData } from '@/lib/validationSchemas';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* ── Left Side: Login Form ── */}
      <Box
        sx={{
          width: { xs: '100%', lg: '450px', xl: '550px' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          bgcolor: '#ffffff',
          px: { xs: 3, sm: 8, lg: 8 },
          py: 6,
          flexShrink: 0,
        }}
      >
        <Box sx={{ mx: 'auto', width: '100%', maxWidth: 360 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '8px',
                bgcolor: 'rgba(91, 169, 179, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Image
                src="/IbarraTravel_logo.png"
                alt="Ibarra Travel"
                fill
                priority
                style={{ objectFit: 'contain' }}
              />
            </Box>
            <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#525252' }}>
              Ibarra Travel
            </Typography>
          </Box>

          {/* Welcome */}
          <Box sx={{ mb: 5 }}>
            <Typography
              sx={{ fontSize: '30px', fontWeight: 900, color: '#525252', lineHeight: 1.2, mb: 1 }}
            >
              Bienvenido de nuevo
            </Typography>
            <Typography sx={{ fontSize: '14px', color: '#8B8DA8' }}>
              Ingresa tus datos para acceder a tus reservas.
            </Typography>
          </Box>

          {/* Alerts */}
          {(submitError || error) && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
              {submitError || error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Username */}
            <Box sx={{ mb: 3 }}>
              <Input
                label="Usuario"
                placeholder="Tu nombre de usuario"
                {...register('userName')}
                error={!!errors.userName}
                helperText={errors.userName?.message}
                autoComplete="username"
              />
            </Box>

            {/* Password */}
            <Box sx={{ mb: 3 }}>
              {/* Label row with Forgot password link */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 0.75,
                }}
              >
                <Typography
                  sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#525252' }}
                >
                  Contraseña
                </Typography>
                <MuiLink
                  href="#"
                  underline="hover"
                  sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#5BA9B3' }}
                >
                  ¿Olvidaste tu contraseña?
                </MuiLink>
              </Box>
              {/* Input with no label (already rendered above) */}
              <Input
                label=""
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingresa tu contraseña"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <Box
                      component="span"
                      onClick={() => setShowPassword((v) => !v)}
                      sx={{
                        cursor: 'pointer',
                        color: '#ADB0C8',
                        display: 'flex',
                        alignItems: 'center',
                        '&:hover': { color: '#8B8DA8' },
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </Box>
                  ),
                }}
              />
            </Box>

            {/* Remember me */}
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  sx={{
                    color: '#D8DAEA',
                    '&.Mui-checked': { color: '#5BA9B3' },
                    p: 0.5,
                    mr: 0.5,
                  }}
                />
              }
              label={
                <Typography sx={{ fontSize: '14px', color: '#525252' }}>
                  Recordarme por 30 días
                </Typography>
              }
              sx={{ mb: 3, ml: 0 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              isLoading={loading}
              sx={{ height: 48, borderRadius: '12px', fontSize: '14px', fontWeight: 700 }}
            >
              Iniciar Sesión
            </Button>
          </form>

          {/* Create account */}
          <Typography sx={{ textAlign: 'center', fontSize: '14px', color: '#8B8DA8' }}>
            ¿No eres miembro?{' '}
            <MuiLink
              href="/signup"
              underline="hover"
              sx={{ fontWeight: 600, color: '#5BA9B3' }}
            >
              Crear una cuenta
            </MuiLink>
          </Typography>
        </Box>
      </Box>

      {/* ── Right Side: Atmospheric Travel Image ── */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'block' },
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Orange tint overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(91, 169, 179, 0.18)',
            mixBlendMode: 'multiply',
            zIndex: 1,
          }}
        />
        {/* Bottom gradient */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(34,22,16,0.65) 0%, transparent 55%)',
            zIndex: 1,
          }}
        />
        {/* Background image */}
        <Box
          component="img"
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80"
          alt="Beautiful Beach Sunset"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Floating content */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 64,
            left: 64,
            right: 64,
            zIndex: 2,
            color: '#ffffff',
          }}
        >
          <Box sx={{ maxWidth: 420 }}>
            {/* Badge */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: '9999px',
                bgcolor: 'rgba(91, 169, 179, 0.35)',
                backdropFilter: 'blur(8px)',
                px: 1.5,
                py: 0.5,
                mb: 2.5,
              }}
            >
              <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#ffffff' }}>
                Destino del mes
              </Typography>
            </Box>

            <Typography
              sx={{
                fontSize: '36px',
                fontWeight: 900,
                lineHeight: 1.15,
                mb: 2,
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              Descubre las joyas más escondidas del mundo.
            </Typography>

            <Typography
              sx={{
                fontSize: '17px',
                color: '#f1f5f9',
                fontWeight: 400,
                lineHeight: 1.65,
                textShadow: '0 1px 4px rgba(0,0,0,0.25)',
              }}
            >
              "El mundo es un libro y los que no viajan solo leen una página."
            </Typography>

            {/* Progress dots */}
            <Box sx={{ mt: 3.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ height: 4, width: 48, bgcolor: '#5BA9B3', borderRadius: '9999px' }} />
              <Box
                sx={{ height: 4, width: 16, bgcolor: 'rgba(255,255,255,0.35)', borderRadius: '9999px' }}
              />
              <Box
                sx={{ height: 4, width: 16, bgcolor: 'rgba(255,255,255,0.35)', borderRadius: '9999px' }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
