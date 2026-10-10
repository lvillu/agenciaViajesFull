import { describe, it, expect, vi, afterEach } from 'vitest';
import { useState, type ChangeEvent } from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material';
import { PrimeReactProvider } from 'primereact/api';
import type { ReactElement } from 'react';
import { Input } from './Input';

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

function ControlledHarness() {
  const [value, setValue] = useState('');
  return (
    <Input
      label="Nombre"
      placeholder="Ej. Juan"
      value={value}
      onChange={(event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
    />
  );
}

describe('Input', () => {
  it('muestra el label sobre el campo', () => {
    renderWithProviders(<Input label="Correo electrónico" />);
    const label = screen.getByText('Correo electrónico');
    expect(label.tagName).toBe('LABEL');
  });

  it('marca el label con asterisco cuando es requerido', () => {
    renderWithProviders(<Input label="Nombre" required />);
    const label = screen.getByText(
      (_, el) => el?.tagName === 'LABEL' && el.textContent === 'Nombre *'
    );
    expect(label).toBeInTheDocument();
  });

  it('aplica el placeholder al input', () => {
    renderWithProviders(<Input label="Cliente" placeholder="Ej. Juan" />);
    expect(screen.getByPlaceholderText('Ej. Juan')).toBeInTheDocument();
  });

  it('actualiza el valor controlado al escribir', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ControlledHarness />);
    const input = screen.getByPlaceholderText('Ej. Juan');
    await user.type(input, 'Ana');
    expect(input).toHaveValue('Ana');
  });

  it('dispara onChange por cada tecla escrita', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<Input label="Teléfono" value="" onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), '123');
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('muestra el helperText debajo del campo', () => {
    renderWithProviders(<Input label="Dirección" helperText="Campo opcional" />);
    expect(screen.getByText('Campo opcional')).toBeInTheDocument();
  });

  it('muestra el mensaje de error cuando error=true', () => {
    renderWithProviders(
      <Input label="Nombre" error helperText="El nombre es requerido" />
    );
    expect(screen.getByText('El nombre es requerido')).toBeInTheDocument();
  });

  it('renderiza un textarea en modo multiline y permite escribir', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Input label="Notas" multiline rows={3} placeholder="Detalles" />);
    const textarea = screen.getByPlaceholderText('Detalles');
    expect(textarea.tagName).toBe('TEXTAREA');
    await user.type(textarea, 'hola');
    expect(textarea).toHaveValue('hola');
  });

  it('no permite escribir cuando está deshabilitado', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <Input label="Teléfono" disabled placeholder="+1 234 567 890" onChange={onChange} />
    );
    const input = screen.getByPlaceholderText('+1 234 567 890');
    expect(input).toBeDisabled();
    await user.type(input, '123');
    expect(onChange).not.toHaveBeenCalled();
  });
});
