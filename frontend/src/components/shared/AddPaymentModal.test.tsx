import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material';
import { PrimeReactProvider } from 'primereact/api';
import { AddPaymentModal } from './AddPaymentModal';
import { paymentService } from '@/services/paymentService';
import type { Payment } from '@/types/payment';

vi.mock('@/services/paymentService', () => ({
  paymentService: {
    create: vi.fn(),
  },
}));

const createMock = vi.mocked(paymentService.create);

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
  totalAmount?: number;
  totalPaid?: number;
  isDollar?: boolean;
}

const setup = (options: SetupOptions = {}) => {
  const onClose = vi.fn();
  const onPaymentAdded = vi.fn();
  const {
    totalAmount = 15000,
    totalPaid = 7000,
    isDollar = false,
  } = options;
  render(
    <PrimeReactProvider value={{ unstyled: true }}>
      <ThemeProvider theme={theme}>
        <AddPaymentModal
          open
          onClose={onClose}
          saleId={7}
          totalAmount={totalAmount}
          totalPaid={totalPaid}
          isDollar={isDollar}
          onPaymentAdded={onPaymentAdded}
        />
      </ThemeProvider>
    </PrimeReactProvider>
  );
  return { onClose, onPaymentAdded };
};

const getLabeledInput = (labelText: RegExp | string) => {
  const label =
    typeof labelText === 'string'
      ? screen.getByText(labelText)
      : screen.getByText(labelText);
  const input = label.parentElement?.querySelector('input');
  if (!input) throw new Error(`No se encontró el input para: ${labelText}`);
  return input as HTMLInputElement;
};

beforeEach(() => {
  vi.clearAllMocks();
  createMock.mockResolvedValue({} as Payment);
});

afterEach(() => cleanup());

describe('AddPaymentModal', () => {
  it('renderiza el resumen financiero con los montos recibidos', () => {
    setup();
    expect(screen.getByText('Resumen Financiero')).toBeInTheDocument();
    expect(screen.getByText('Total Reserva')).toBeInTheDocument();
    expect(screen.getByText('$15,000.00 MXN')).toBeInTheDocument();
    expect(screen.getByText('Total Pagado')).toBeInTheDocument();
    expect(screen.getByText('$7,000.00 MXN')).toBeInTheDocument();
    expect(screen.getByText('Saldo Actual')).toBeInTheDocument();
    expect(screen.getByText('$8,000.00 MXN')).toBeInTheDocument();
  });

  it('en modo USD muestra la etiqueta del monto y el campo de tipo de cambio', () => {
    setup({ isDollar: true });
    expect(screen.getByText('Monto del Pago (USD)')).toBeInTheDocument();
    expect(screen.getByText('Tipo de Cambio (MXN por USD)')).toBeInTheDocument();
  });

  it('calcula el saldo después del pago al ingresar un monto', async () => {
    const user = userEvent.setup();
    setup();
    const amountInput = getLabeledInput(/Monto del Pago/);
    await user.clear(amountInput);
    await user.type(amountInput, '500');
    expect(await screen.findByText('Saldo después del pago:')).toBeInTheDocument();
    expect(screen.getByText('$7,500.00 MXN')).toBeInTheDocument();
  });

  it('al enviar sin monto muestra error de validación y no llama al servicio', async () => {
    const user = userEvent.setup();
    const { onClose, onPaymentAdded } = setup();
    await user.click(screen.getByRole('button', { name: /Registrar Pago/ }));
    expect(await screen.findByText('El monto debe ser mayor a 0')).toBeInTheDocument();
    expect(createMock).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(onPaymentAdded).not.toHaveBeenCalled();
  });

  it('al enviar válido llama a paymentService.create, onPaymentAdded y onClose', async () => {
    const user = userEvent.setup();
    const { onClose, onPaymentAdded } = setup();
    const amountInput = getLabeledInput(/Monto del Pago/);
    await user.clear(amountInput);
    await user.type(amountInput, '500');
    await user.click(screen.getByRole('button', { name: /Registrar Pago/ }));
    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ saleId: 7, amount: 500 })
    );
    await waitFor(() => {
      expect(onPaymentAdded).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('en modo USD calcula el valor en pesos con el tipo de cambio', async () => {
    const user = userEvent.setup();
    setup({ isDollar: true });
    const amountInput = getLabeledInput(/Monto del Pago/);
    const rateInput = getLabeledInput('Tipo de Cambio (MXN por USD)');
    await user.clear(amountInput);
    await user.type(amountInput, '100');
    await user.clear(rateInput);
    await user.type(rateInput, '20');
    expect(await screen.findByText('$2,000.00 MXN')).toBeInTheDocument();
  });
});
