/**
 * Input Component
 * Componente de entrada basado en PrimeReact InputText.
 * Label siempre fijo encima del campo — nunca flotante.
 * Compatible con react-hook-form: register (sin controlled value) y Controller (value+onChange).
 */

'use client';

import React, { forwardRef } from 'react';
import { Box, Typography, FormHelperText, Select } from '@mui/material';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';

export interface InputProps {
  label: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  name?: string;
  value?: any;
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  disabled?: boolean;
  fullWidth?: boolean;
  // Select mode
  select?: boolean;
  children?: React.ReactNode;
  // MUI compat adornments
  InputProps?: {
    endAdornment?: React.ReactNode;
    startAdornment?: React.ReactNode;
  };
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  // Kept for API compatibility — label is always shrunk (fixed above)
  InputLabelProps?: Record<string, any>;
  // Multiline
  multiline?: boolean;
  rows?: number;
  // sx ignored — layout handled by parent
  sx?: any;
  [key: string]: any;
}

const BASE_INPUT_STYLE = {
  width: '100%',
  height: '44px',
  borderRadius: '8px',
  padding: '0 12px',
  fontSize: '14px',
  fontFamily: '"Public Sans", system-ui, sans-serif',
  color: '#525252',
  boxSizing: 'border-box' as const,
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const getBorderColor = (error: boolean) =>
  error ? '#ef4444' : '#D8DAEA';

const getBgColor = (disabled: boolean) =>
  disabled ? 'rgba(189, 191, 220, 0.15)' : '#ffffff';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error = false,
      helperText,
      required = false,
      placeholder,
      type = 'text',
      name,
      value,
      onChange,
      onBlur,
      disabled = false,
      select = false,
      children,
      InputProps: muiInputProps,
      inputProps: nativeInputProps,
      InputLabelProps: _InputLabelProps,
      multiline = false,
      rows = 3,
      sx: _sx,
    },
    ref
  ) => {
    const hasEnd = !!muiInputProps?.endAdornment;
    const hasSt = !!muiInputProps?.startAdornment;

    const labelSx = {
      fontSize: '0.875rem',
      fontWeight: 600,
      color: error ? '#ef4444' : '#525252',
      mb: 0.75,
      display: 'block',
    };

    // --- SELECT ---
    if (select && children) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography component="label" sx={labelSx}>
            {label}{required && ' *'}
          </Typography>
          <Select
            name={name}
            value={value !== undefined ? value : ''}
            onChange={onChange as any}
            onBlur={onBlur as any}
            disabled={disabled}
            error={error}
            size="small"
            displayEmpty
            sx={{
              borderRadius: '8px',
              height: '44px',
              fontSize: '14px',
              fontFamily: '"Public Sans", system-ui, sans-serif',
              backgroundColor: getBgColor(disabled),
            }}
          >
            {children}
          </Select>
          {helperText && (
            <FormHelperText error={error} sx={{ mx: 0, mt: 0.5 }}>
              {helperText}
            </FormHelperText>
          )}
        </Box>
      );
    }

    // --- MULTILINE (Textarea) ---
    if (multiline) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography component="label" sx={labelSx}>
            {label}{required && ' *'}
          </Typography>
          <InputTextarea
            name={name}
            value={value}
            onChange={onChange as any}
            onBlur={onBlur as any}
            disabled={disabled}
            placeholder={placeholder}
            rows={rows}
            unstyled
            className="ta-input"
            style={{
              ...BASE_INPUT_STYLE,
              height: 'auto',
              minHeight: `${rows * 24 + 20}px`,
              padding: '10px 12px',
              border: `1px solid ${getBorderColor(error)}`,
              backgroundColor: getBgColor(disabled),
              resize: 'vertical',
            }}
          />
          {helperText && (
            <FormHelperText error={error} sx={{ mx: 0, mt: 0.5 }}>
              {helperText}
            </FormHelperText>
          )}
        </Box>
      );
    }

    // --- TEXT / NUMBER / DATE / EMAIL / TEL ---
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {label && (
          <Typography component="label" sx={labelSx}>
            {label}{required && ' *'}
          </Typography>
        )}
        <Box sx={{ position: 'relative', width: '100%' }}>
          {hasSt && (
            <Box
              sx={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                zIndex: 1,
                pointerEvents: 'none',
              }}
            >
              {muiInputProps!.startAdornment}
            </Box>
          )}
          <InputText
            ref={ref}
            name={name}
            type={type}
            value={value}
            onChange={onChange as any}
            onBlur={onBlur as any}
            disabled={disabled}
            placeholder={placeholder}
            unstyled
            className="ta-input"
            style={{
              ...BASE_INPUT_STYLE,
              border: `1px solid ${getBorderColor(error)}`,
              backgroundColor: getBgColor(disabled),
              paddingLeft: hasSt ? '40px' : '12px',
              paddingRight: hasEnd ? '40px' : '12px',
            }}
            {...(nativeInputProps as any)}
          />
          {hasEnd && (
            <Box
              sx={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {muiInputProps!.endAdornment}
            </Box>
          )}
        </Box>
        {helperText && (
          <FormHelperText error={error} sx={{ mx: 0, mt: 0.5 }}>
            {helperText}
          </FormHelperText>
        )}
      </Box>
    );
  }
);

Input.displayName = 'Input';
