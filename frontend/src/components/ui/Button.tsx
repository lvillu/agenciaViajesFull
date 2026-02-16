/**
 * Button Component
 * Componente de botón reutilizable basado en Material UI
 */

'use client';

import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress, Box } from '@mui/material';

interface ButtonProps extends MuiButtonProps {
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  isLoading = false,
  children,
  disabled,
  ...props
}) => {
  return (
    <MuiButton
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} color="inherit" />
          Cargando...
        </Box>
      ) : (
        children
      )}
    </MuiButton>
  );
};
