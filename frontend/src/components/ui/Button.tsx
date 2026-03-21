/**
 * Button Component
 * Botón basado en PrimeReact con soporte para la API de MUI (variant, color, sx).
 */

'use client';

import React from 'react';
import { Box, CircularProgress } from '@mui/material';

interface ButtonProps {
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'inherit' | 'error' | 'warning' | 'success';
  isLoading?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
  sx?: Record<string, any>;
  [key: string]: any;
}

const VARIANT_STYLES: Record<string, Record<string, string | number>> = {
  'contained-primary': {
    backgroundColor: '#ec5b13',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 4px 14px rgba(236, 91, 19, 0.25)',
  },
  'contained-error': {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
  },
  'contained-success': {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
  },
  'contained-default': {
    backgroundColor: '#e2e8f0',
    color: '#0f172a',
    border: 'none',
  },
  'outlined-primary': {
    backgroundColor: 'transparent',
    color: '#ec5b13',
    border: '1px solid #ec5b13',
  },
  'outlined-error': {
    backgroundColor: 'transparent',
    color: '#dc2626',
    border: '1px solid #dc2626',
  },
  'outlined-default': {
    backgroundColor: 'transparent',
    color: '#475569',
    border: '1px solid #cbd5e1',
  },
  'text-primary': {
    backgroundColor: 'transparent',
    color: '#ec5b13',
    border: 'none',
  },
  'text-default': {
    backgroundColor: 'transparent',
    color: '#475569',
    border: 'none',
  },
};

function getVariantStyle(variant: string = 'contained', color: string = 'primary') {
  const key = `${variant}-${color}`;
  return VARIANT_STYLES[key] ?? VARIANT_STYLES[`${variant}-default`] ?? VARIANT_STYLES['contained-primary'];
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'contained',
  color = 'primary',
  isLoading = false,
  children,
  disabled,
  onClick,
  type = 'button',
  startIcon,
  endIcon,
  fullWidth = false,
  sx,
  ...rest
}) => {
  const variantStyle = getVariantStyle(variant, color);
  const isDisabled = disabled || isLoading;

  return (
    <Box
      component="button"
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        height: 44,
        px: 2.5,
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 700,
        fontFamily: '"Public Sans", system-ui, sans-serif',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        transition: 'all 0.15s',
        width: fullWidth ? '100%' : undefined,
        '&:hover:not(:disabled)': {
          filter: 'brightness(1.08)',
          boxShadow:
            variant === 'contained' && color === 'primary'
              ? '0 4px 14px rgba(236, 91, 19, 0.35)'
              : undefined,
        },
        '&:active:not(:disabled)': { filter: 'brightness(0.96)' },
        ...variantStyle,
        ...sx,
      }}
      {...rest}
    >
      {isLoading ? (
        <>
          <CircularProgress size={18} color="inherit" />
          Cargando...
        </>
      ) : (
        <>
          {startIcon && <span style={{ display: 'flex', alignItems: 'center' }}>{startIcon}</span>}
          {children}
          {endIcon && <span style={{ display: 'flex', alignItems: 'center' }}>{endIcon}</span>}
        </>
      )}
    </Box>
  );
};
