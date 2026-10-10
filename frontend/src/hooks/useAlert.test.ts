import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

import Swal from 'sweetalert2';
import { useAlert } from './useAlert';

const mockedFire = Swal.fire as unknown as ReturnType<typeof vi.fn>;

describe('useAlert', () => {
  beforeEach(() => {
    mockedFire.mockReset();
    mockedFire.mockResolvedValue({ isConfirmed: true });
  });

  it('showSuccess llama a Swal.fire con icono success', () => {
    const { showSuccess } = useAlert();
    showSuccess('Todo bien');

    expect(mockedFire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '¡Éxito!',
        text: 'Todo bien',
        icon: 'success',
      })
    );
  });

  it('showSuccess acepta título personalizado', () => {
    const { showSuccess } = useAlert();
    showSuccess('Guardado', 'Operación completada');

    expect(mockedFire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Operación completada',
        text: 'Guardado',
      })
    );
  });

  it('showError usa icono error y título Error', () => {
    const { showError } = useAlert();
    showError('Algo falló');

    expect(mockedFire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Error',
        text: 'Algo falló',
        icon: 'error',
      })
    );
  });

  it('showWarning usa icono warning', () => {
    const { showWarning } = useAlert();
    showWarning('Cuidado');

    expect(mockedFire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'warning' }));
  });

  it('showInfo usa icono info', () => {
    const { showInfo } = useAlert();
    showInfo('Dato útil');

    expect(mockedFire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'info' }));
  });

  it('showConfirm retorna true cuando se confirma', async () => {
    const { showConfirm } = useAlert();

    const resultado = await showConfirm('¿Eliminar?');

    expect(mockedFire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '¿Está seguro?',
        text: '¿Eliminar?',
        icon: 'question',
        showCancelButton: true,
      })
    );
    expect(resultado).toBe(true);
  });

  it('showConfirm retorna false cuando se cancela', async () => {
    mockedFire.mockResolvedValue({ isConfirmed: false });

    const { showConfirm } = useAlert();
    const resultado = await showConfirm('¿Eliminar?', 'Confirmar acción');

    expect(resultado).toBe(false);
  });

  it('showCustom aplica opciones y defaults', () => {
    const { showCustom } = useAlert();
    showCustom({ text: 'Mensaje', title: 'Título' });

    expect(mockedFire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Título',
        text: 'Mensaje',
        icon: 'info',
        confirmButtonText: 'Aceptar',
        showCancelButton: false,
      })
    );
  });
});
