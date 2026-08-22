import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material';
import { PrimeReactProvider } from 'primereact/api';
import type { ReactElement } from 'react';
import { ProviderFormModal } from './ProviderFormModal';
import type { Provider } from '@/types/provider';

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
  provider?: Provider | null;
  isLoading?: boolean;
}

const setup = (options: SetupOptions = {}) => {
  const onClose = vi.fn();
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  const { open = true, provider = null, isLoading = false } = options;
  render(
    <PrimeReactProvider value={{ unstyled: true }}>
      <ThemeProvider theme={theme}>
        <ProviderFormModal
          open={open}
          onClose={onClose}
          onSubmit={onSubmit}
          provider={provider}
          isLoading={isLoading}
        />
      </ThemeProvider>
    </PrimeReactProvider>
  );
  return { onClose, onSubmit };
};

const baseProvider: Provider = {
  id: 3,
  name: 'Skyline Airways',
  acronym: 'SKY',
  email: 'contacto@skyline.com',
  phone: '+52 55 1234 5678',
  providerContactName: 'John Doe',
  depositPercentage: 25,
  finalPaymentDaysBefore: 30,
  profitPercentage: 10,
  active: true,
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => cleanup());

describe('ProviderFormModal', () => {
  it('muestra el título y los campos cuando está abierto', () => {
    setup();
    expect(screen.getByText('Agregar Proveedor')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej. Skyline Airways')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('SA')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nombre completo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('contacto@proveedor.com')).toBeInTheDocument();
    expect(screen.getByText('% de Ganancia')).toBeInTheDocument();
  });

  it('al enviar vacío muestra los errores de campos requeridos y no llama onSubmit', async () => {
    const user = userEvent.setup();
    const { onSubmit } = setup();
    await user.click(screen.getByRole('button', { name: 'Guardar Proveedor' }));
    expect(await screen.findByText('El nombre es requerido')).toBeInTheDocument();
    expect(screen.getByText('El acrónimo es requerido')).toBeInTheDocument();
    expect(screen.getByText('El nombre de contacto es requerido')).toBeInTheDocument();
    expect(screen.getByText('El email es requerido')).toBeInTheDocument();
    expect(screen.getByText('El teléfono es requerido')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('llama a onSubmit con los datos del formulario al enviar válido', async () => {
    const user = userEvent.setup();
    const { onSubmit } = setup();
    await user.type(screen.getByPlaceholderText('Ej. Skyline Airways'), 'AeroMéxico');
    await user.type(screen.getByPlaceholderText('SA'), 'AM');
    await user.type(screen.getByPlaceholderText('Nombre completo'), 'María Gómez');
    await user.type(screen.getByPlaceholderText('contacto@proveedor.com'), 'mgomez@aero.mx');
    await user.type(screen.getByPlaceholderText('+1 (555) 000-0000'), '5512345678');
    await user.type(screen.getByPlaceholderText('25'), '25');
    await user.type(screen.getByPlaceholderText('30'), '30');
    await user.type(screen.getByPlaceholderText('10'), '15');
    await user.click(screen.getByRole('button', { name: 'Guardar Proveedor' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'AeroMéxico',
        acronym: 'AM',
        providerContactName: 'María Gómez',
        email: 'mgomez@aero.mx',
        phone: '5512345678',
        depositPercentage: 25,
        finalPaymentDaysBefore: 30,
        profitPercentage: 15,
      })
    );
  });

  it('el botón Cancelar llama a onClose', async () => {
    const user = userEvent.setup();
    const { onClose } = setup();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('el botón de cerrar llama a onClose sin enviar', async () => {
    const user = userEvent.setup();
    const { onClose, onSubmit } = setup();
    await user.click(screen.getByRole('button', { name: 'close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('en modo edición muestra título Actualizar y precarga los datos', () => {
    setup({ provider: baseProvider });
    expect(screen.getByText('Editar Proveedor')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Skyline Airways')).toBeInTheDocument();
    expect(screen.getByDisplayValue('SKY')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('25')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Actualizar Proveedor' })
    ).toBeInTheDocument();
  });
});
