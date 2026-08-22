import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { PrimeReactProvider } from 'primereact/api';
import type { ReactElement } from 'react';
import { DateInput } from './DateInput';

interface MockCalendarProps {
  value?: Date | null;
  onChange?: (event: { value: Date | null }) => void;
  placeholder?: string;
  disabled?: boolean;
}

vi.mock('primereact/calendar', () => ({
  Calendar: ({ value, onChange, placeholder, disabled }: MockCalendarProps) => (
    <input
      data-testid="calendar-input"
      type="date"
      placeholder={placeholder}
      disabled={disabled}
      value={
        value
          ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
          : ''
      }
      onChange={(event) => {
        const [year, month, day] = event.target.value.split('-').map(Number);
        const parsed =
          year && month && day ? new Date(year, month - 1, day) : null;
        onChange?.({ value: parsed });
      }}
    />
  ),
}));

const theme = createTheme({
  palette: {
    primary: { main: '#5BA9B3', light: 'rgba(91, 169, 179, 0.1)', contrastText: '#ffffff' },
    secondary: { main: '#BDBFDC' },
    background: { default: 'rgba(189, 191, 220, 0.18)', paper: '#ffffff' },
    text: { primary: '#525252', secondary: '#8B8DA8', disabled: '#ADB0C8' },
    success: { main: '#16a34a' },
    warning: { main: '#ca8a04' },
    error: { main: '#dc2626' },
    divider: '#D8DAEA',
  },
});

const renderWithProviders = (ui: ReactElement) =>
  render(
    <PrimeReactProvider value={{ unstyled: true }}>
      <ThemeProvider theme={theme}>{ui}</ThemeProvider>
    </PrimeReactProvider>
  );

afterEach(() => cleanup());

describe('DateInput', () => {
  it('muestra el label sobre el campo', () => {
    renderWithProviders(<DateInput label="Fecha de Viaje" />);
    const label = screen.getByText('Fecha de Viaje');
    expect(label.tagName).toBe('LABEL');
  });

  it('marca el label con asterisco cuando es requerido', () => {
    renderWithProviders(<DateInput label="Fecha" required />);
    const label = screen.getByText(
      (_, el) => el?.tagName === 'LABEL' && el.textContent === 'Fecha *'
    );
    expect(label).toBeInTheDocument();
  });

  it('aplica el placeholder por defecto al input', () => {
    renderWithProviders(<DateInput label="Fecha de Salida" />);
    expect(screen.getByTestId('calendar-input')).toHaveAttribute(
      'placeholder',
      'dd/mm/aaaa'
    );
  });

  it('sincroniza el valor inicial YYYY-MM-DD con el input', () => {
    renderWithProviders(<DateInput label="Fecha" value="2019-12-31" />);
    expect(screen.getByTestId('calendar-input')).toHaveValue('2019-12-31');
  });

  it('dispara onChange con formato YYYY-MM-DD al seleccionar una fecha', () => {
    const onChange = vi.fn();
    renderWithProviders(<DateInput label="Fecha" onChange={onChange} />);
    fireEvent.change(screen.getByTestId('calendar-input'), {
      target: { value: '2026-03-15' },
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('2026-03-15');
  });

  it('dispara onChange con cadena vacía al limpiar la fecha', () => {
    const onChange = vi.fn();
    renderWithProviders(<DateInput label="Fecha" value="2026-03-15" onChange={onChange} />);
    fireEvent.change(screen.getByTestId('calendar-input'), {
      target: { value: '' },
    });
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('muestra el helperText de error cuando error=true', () => {
    renderWithProviders(
      <DateInput label="Fecha" error helperText="La fecha es requerida" />
    );
    expect(screen.getByText('La fecha es requerida')).toBeInTheDocument();
  });

  it('deshabilita el input cuando disabled=true', () => {
    renderWithProviders(<DateInput label="Fecha" disabled />);
    expect(screen.getByTestId('calendar-input')).toBeDisabled();
  });
});
