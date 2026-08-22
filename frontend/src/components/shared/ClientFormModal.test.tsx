import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material';
import { PrimeReactProvider } from 'primereact/api';
import type { ReactElement } from 'react';
import { ClientFormModal } from './ClientFormModal';
import type { Client } from '@/types/client';

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

interface SetupOptions {
  open?: boolean;
  client?: Client | null;
  isLoading?: boolean;
}

const setup = (options: SetupOptions = {}) => {
  const onClose = vi.fn();
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  const { open = true, client = null, isLoading = false } = options;
  render(
    <PrimeReactProvider value={{ unstyled: true }}>
      <ThemeProvider theme={theme}>
        <ClientFormModal
          open={open}
          onClose={onClose}
          onSubmit={onSubmit}
          client={client}
          isLoading={isLoading}
        />
      </ThemeProvider>
    </PrimeReactProvider>
  );
  return { onClose, onSubmit };
};

const baseClient: Client = {
  id: 1,
  name: 'Ana',
  lastName: 'López',
  address: 'Calle 9',
  phone: '5512345678',
  email: 'ana@correo.com',
  birthDate: '1990-05-15',
  active: true,
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => cleanup());

describe('ClientFormModal', () => {
  it('no renderiza nada cuando open=false', () => {
    setup({ open: false });
    expect(screen.queryByText('Agregar Cliente')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Crear' })).not.toBeInTheDocument();
  });

  it('muestra el título y los campos cuando está abierto', () => {
    setup();
    expect(screen.getByText('Agregar Cliente')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej. Juan')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej. Pérez')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Calle 123, Ciudad')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('+1 234 567 890')).toBeInTheDocument();
    expect(screen.getByText('Fecha de Nacimiento')).toBeInTheDocument();
  });

  it('al enviar vacío muestra los errores de campos requeridos y no llama onSubmit', async () => {
    const user = userEvent.setup();
    const { onSubmit } = setup();
    await user.click(screen.getByRole('button', { name: 'Crear' }));
    expect(await screen.findByText('El nombre es requerido')).toBeInTheDocument();
    expect(screen.getByText('El apellido es requerido')).toBeInTheDocument();
    expect(screen.getByText('El teléfono es requerido')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('llama a onSubmit con los datos del formulario al enviar válido', async () => {
    const user = userEvent.setup();
    const { onSubmit } = setup();
    await user.type(screen.getByPlaceholderText('Ej. Juan'), 'Juan');
    await user.type(screen.getByPlaceholderText('Ej. Pérez'), 'Pérez');
    await user.type(screen.getByPlaceholderText('+1 234 567 890'), '5512345678');
    await user.click(screen.getByRole('button', { name: 'Crear' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Juan',
        lastName: 'Pérez',
        phone: '5512345678',
        address: '',
        email: '',
        birthDate: '',
        active: true,
      })
    );
  });

  it('el botón de cerrar llama a onClose sin enviar', async () => {
    const user = userEvent.setup();
    const { onClose, onSubmit } = setup();
    await user.click(screen.getByRole('button', { name: 'close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('el botón Cancelar llama a onClose', async () => {
    const user = userEvent.setup();
    const { onClose } = setup();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('en modo edición muestra título Actualizar y precarga los datos', () => {
    setup({ client: baseClient });
    expect(screen.getByText('Editar Cliente')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ana')).toBeInTheDocument();
    expect(screen.getByDisplayValue('López')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ana@correo.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Actualizar' })).toBeInTheDocument();
  });
});
