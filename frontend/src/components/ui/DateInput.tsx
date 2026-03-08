/**
 * DateInput Component
 * Campo de fecha basado en PrimeReact Calendar.
 * Label fijo arriba — nunca flotante. Compatible con react-hook-form Controller.
 * Salida: string YYYY-MM-DD (igual que <input type="date">)
 */

'use client';

import React, { useCallback } from 'react';
import { Box, Typography, FormHelperText } from '@mui/material';
import { Calendar } from 'primereact/calendar';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';

export interface DateInputProps {
  label: string;
  value?: string | null; // YYYY-MM-DD or ''
  onChange?: (value: string) => void;
  onBlur?: () => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  name?: string;
  minDate?: Date;
  maxDate?: Date;
}

/** Convierte string YYYY-MM-DD a Date local (sin desfase UTC) */
function toDate(val?: string | null): Date | null {
  if (!val) return null;
  const parts = val.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

/** Convierte Date a string YYYY-MM-DD */
function toDateString(d: Date | null | undefined): string {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  onBlur,
  error = false,
  helperText,
  required = false,
  disabled = false,
  placeholder = 'dd/mm/aaaa',
  name,
  minDate,
  maxDate,
}) => {
  const handleChange = useCallback(
    (e: { value: Date | null | undefined }) => {
      onChange?.(toDateString(e.value));
    },
    [onChange]
  );

  const borderColor = error ? '#ef4444' : '#cbd5e1';
  const labelSx = {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: error ? '#ef4444' : '#334155',
    mb: 0.75,
    display: 'block',
  };

  const calendarPT = {
    root: {
      style: { width: '100%', display: 'flex', alignItems: 'center' },
    },
    input: {
      style: {
        flex: '1 1 auto',
        height: '44px',
        borderRadius: '8px 0 0 8px',
        padding: '0 12px',
        fontSize: '14px',
        fontFamily: '"Public Sans", system-ui, sans-serif',
        color: '#0f172a',
        border: `1px solid ${borderColor}`,
        borderRight: 'none',
        backgroundColor: disabled ? '#f1f5f9' : '#ffffff',
        outline: 'none',
        boxSizing: 'border-box' as const,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        cursor: disabled ? 'not-allowed' : 'text',
      },
    },
    dropdownButton: {
      root: {
        style: {
          background: error ? '#ef4444' : '#ec5b13',
          border: `1px solid ${error ? '#ef4444' : '#ec5b13'}`,
          borderLeft: 'none',
          borderRadius: '0 8px 8px 0',
          minWidth: '44px',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          color: '#ffffff',
          flexShrink: 0,
          padding: 0,
          transition: 'background 0.2s',
        },
      },
    },
    panel: {
      style: {
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.14)',
        padding: '12px 14px 14px',
        fontFamily: '"Public Sans", system-ui, sans-serif',
        zIndex: 9999,
        overflow: 'hidden',
        minWidth: '280px',
      },
    },
    header: {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '10px',
        marginBottom: '8px',
        borderBottom: '1px solid #f1f5f9',
      },
    },
    previousButton: {
      root: {
        style: {
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#64748b',
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          padding: 0,
          fontSize: '14px',
          transition: 'background 0.15s, color 0.15s',
        },
      },
    },
    nextButton: {
      root: {
        style: {
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#64748b',
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          padding: 0,
          fontSize: '14px',
          transition: 'background 0.15s, color 0.15s',
        },
      },
    },
    title: {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      },
    },
    monthTitle: {
      style: {
        fontWeight: 700,
        fontSize: '14px',
        color: '#0f172a',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '2px 6px',
        borderRadius: '4px',
        fontFamily: '"Public Sans", system-ui, sans-serif',
        transition: 'background 0.15s',
      },
    },
    yearTitle: {
      style: {
        fontWeight: 700,
        fontSize: '14px',
        color: '#0f172a',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '2px 6px',
        borderRadius: '4px',
        fontFamily: '"Public Sans", system-ui, sans-serif',
        transition: 'background 0.15s',
      },
    },
    table: {
      style: {
        borderCollapse: 'separate' as const,
        borderSpacing: '2px',
        width: '100%',
        marginTop: '4px',
      },
    },
    weekDay: {
      style: {
        fontSize: '11px',
        fontWeight: 600,
        color: '#94a3b8',
        textAlign: 'center' as const,
        padding: '2px 0 6px',
        width: '36px',
      },
    },
    day: {
      style: {
        textAlign: 'center' as const,
        padding: '1px',
      },
    },
    // dayLabel is dynamic — handled via CSS class in layout.tsx
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography component="label" sx={labelSx}>
        {label}
        {required && ' *'}
      </Typography>
      <Calendar
        name={name}
        value={toDate(value)}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        dateFormat="dd/mm/yy"
        showIcon
        iconPos="right"
        placeholder={placeholder}
        icon={
          <CalendarMonthOutlinedIcon
            sx={{ fontSize: 18, color: '#ffffff', display: 'flex' }}
          />
        }
        panelClassName="ta-datepicker-panel"
        minDate={minDate}
        maxDate={maxDate}
        pt={calendarPT}
      />
      {helperText && (
        <FormHelperText error={error} sx={{ mx: 0, mt: 0.5 }}>
          {helperText}
        </FormHelperText>
      )}
    </Box>
  );
};

DateInput.displayName = 'DateInput';
