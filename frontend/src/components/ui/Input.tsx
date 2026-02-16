/**
 * Input Component
 * Componente de entrada reutilizable basado en Material UI
 */

'use client';

import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

interface InputProps extends Omit<TextFieldProps, 'variant'> {
  label: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error = false,
  helperText,
  required = false,
  fullWidth = true,
  ...props
}) => {
  return (
    <TextField
      label={label}
      variant="outlined"
      fullWidth={fullWidth}
      error={error}
      helperText={helperText}
      size="small"
      required={required}
      {...props}
    />
  );
};
