/**
 * DateInput Component
 * Campo de fecha basado en PrimeReact Calendar.
 * Label fijo arriba — nunca flotante. Compatible con react-hook-form Controller.
 * Salida: string YYYY-MM-DD (igual que <input type="date">)
 *
 * Usa className en pt (no inline style) para que el CSS en layout.tsx
 * pueda controlar hover, selected, today, etc.
 * En unstyled:true, PrimeReact NO agrega las clases p-* por defecto,
 * por eso todas las clases son custom ta-cal-*.
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

// pt functions for dynamic day/month/year states
// Context shape from PrimeReact v10: { selected, date: { today, currentMonth, selectable } }
const dayLabelPt = (opts: any) => {
  const ctx = opts?.context ?? {};
  const date = ctx.date ?? {};
  return {
    className: [
      'ta-cal-dl',
      ctx.selected && 'sel',
      date.today && 'tod',
      date.currentMonth === false && 'other',
      date.selectable === false && 'dis',
    ]
      .filter(Boolean)
      .join(' '),
  };
};

const monthPt = (opts: any) => ({
  className: ['ta-cal-mitem', opts?.context?.selected && 'sel']
    .filter(Boolean)
    .join(' '),
});

const yearPt = (opts: any) => ({
  className: ['ta-cal-yitem', opts?.context?.selected && 'sel']
    .filter(Boolean)
    .join(' '),
});

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

  const labelSx = {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: error ? '#ef4444' : '#334155',
    mb: 0.75,
    display: 'block',
  };

  // Wrapper class drives error/disabled styles via CSS
  const wrapperClass = [
    'ta-cal-wrapper',
    error && 'ta-cal-err',
    disabled && 'ta-cal-dis',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }} className={wrapperClass}>
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
        appendTo={() => document.body}
        transitionOptions={{ timeout: 0 }}
        minDate={minDate}
        maxDate={maxDate}
        pt={{
          root:           { className: 'ta-cal-root' },
          input:          { className: 'ta-cal-input' },
          dropdownButton: { root: { className: 'ta-cal-btn' } },
          panel:          { className: 'ta-datepicker-panel' },
          header:         { className: 'ta-cal-hdr' },
          previousButton: { root: { className: 'ta-cal-nav' } },
          nextButton:     { root: { className: 'ta-cal-nav' } },
          title:          { className: 'ta-cal-title' },
          monthTitle:     { className: 'ta-cal-period-btn' },
          yearTitle:      { className: 'ta-cal-period-btn' },
          table:          { className: 'ta-cal-table' },
          weekDay:        { className: 'ta-cal-wday' },
          day:            { className: 'ta-cal-day' },
          dayLabel:       dayLabelPt,
          monthPicker:    { className: 'ta-cal-mpicker' },
          month:          monthPt,
          yearPicker:     { className: 'ta-cal-ypicker' },
          year:           yearPt,
        }}
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
