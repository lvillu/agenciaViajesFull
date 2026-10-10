import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material';
import type { ReactElement } from 'react';
import { Button } from './Button';

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

const renderWithTheme = (ui: ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

afterEach(() => cleanup());

describe('Button', () => {
  it('renderiza su contenido', () => {
    renderWithTheme(<Button>Guardar cambios</Button>);
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument();
  });

  it('usa type="button" por defecto', () => {
    renderWithTheme(<Button>Por defecto</Button>);
    expect(screen.getByRole('button', { name: 'Por defecto' })).toHaveAttribute('type', 'button');
  });

  it('aplica el atributo type recibido', () => {
    renderWithTheme(<Button type="submit">Enviar</Button>);
    expect(screen.getByRole('button', { name: 'Enviar' })).toHaveAttribute('type', 'submit');
  });

  it.each([
    ['contained', 'primary'],
    ['contained', 'error'],
    ['contained', 'success'],
    ['outlined', 'primary'],
    ['outlined', 'error'],
    ['text', 'primary'],
    ['outlined', 'secondary'],
    ['text', 'secondary'],
  ] as const)('renderiza la variante %s con color %s', (variant, color) => {
    renderWithTheme(
      <Button variant={variant} color={color}>
        Acción
      </Button>
    );
    expect(screen.getByRole('button', { name: 'Acción' })).toBeInTheDocument();
  });

  it('renderiza startIcon y endIcon alrededor del contenido', () => {
    renderWithTheme(
      <Button startIcon={<span>inicio</span>} endIcon={<span>fin</span>}>
        Centro
      </Button>
    );
    expect(screen.getByText('inicio')).toBeInTheDocument();
    expect(screen.getByText('Centro')).toBeInTheDocument();
    expect(screen.getByText('fin')).toBeInTheDocument();
  });

  it('dispara onClick al hacer clic', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    renderWithTheme(<Button onClick={onClick}>Presionar</Button>);
    await user.click(screen.getByRole('button', { name: 'Presionar' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('tiene el atributo disabled cuando se pasa disabled', () => {
    renderWithTheme(<Button disabled>Bloqueado</Button>);
    expect(screen.getByRole('button', { name: 'Bloqueado' })).toBeDisabled();
  });

  it('no dispara onClick cuando está deshabilitado', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    renderWithTheme(
      <Button onClick={onClick} disabled>
        Bloqueado
      </Button>
    );
    await user.click(screen.getByRole('button', { name: 'Bloqueado' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('isLoading deshabilita el botón y muestra indicador de carga', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    renderWithTheme(
      <Button isLoading onClick={onClick}>
        Enviar
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('oculta los iconos mientras está cargando', () => {
    renderWithTheme(
      <Button isLoading startIcon={<span>icono</span>}>
        Enviar
      </Button>
    );
    expect(screen.queryByText('icono')).not.toBeInTheDocument();
  });
});
