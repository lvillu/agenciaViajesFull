/**
 * useAlert Hook
 * Hook reutilizable para mostrar mensajes de SweetAlert2
 * Configurado con el sistema de diseño FlowBit
 */

'use client';

import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';

interface AlertOptions {
  title?: string;
  text: string;
  icon?: SweetAlertIcon;
  confirmButtonText?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
}

export const useAlert = () => {
  /**
   * Muestra un mensaje de éxito
   */
  const showSuccess = (message: string, title: string = '¡Éxito!'): Promise<SweetAlertResult> => {
    return Swal.fire({
      title,
      text: message,
      icon: 'success',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#27AE60', // success.main del design system
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        htmlContainer: 'swal-text',
      },
    });
  };

  /**
   * Muestra un mensaje de error
   */
  const showError = (message: string, title: string = 'Error'): Promise<SweetAlertResult> => {
    return Swal.fire({
      title,
      text: message,
      icon: 'error',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#EB5757', // error.main del design system
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        htmlContainer: 'swal-text',
      },
    });
  };

  /**
   * Muestra un mensaje de advertencia
   */
  const showWarning = (message: string, title: string = 'Advertencia'): Promise<SweetAlertResult> => {
    return Swal.fire({
      title,
      text: message,
      icon: 'warning',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#F2C94C', // warning.main del design system
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        htmlContainer: 'swal-text',
      },
    });
  };

  /**
   * Muestra un mensaje de información
   */
  const showInfo = (message: string, title: string = 'Información'): Promise<SweetAlertResult> => {
    return Swal.fire({
      title,
      text: message,
      icon: 'info',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#2F80ED', // primary.main del design system
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        htmlContainer: 'swal-text',
      },
    });
  };

  /**
   * Muestra un diálogo de confirmación
   */
  const showConfirm = async (
    message: string,
    title: string = '¿Está seguro?',
    confirmText: string = 'Confirmar',
    cancelText: string = 'Cancelar'
  ): Promise<boolean> => {
    const result = await Swal.fire({
      title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: '#2F80ED', // primary.main del design system
      cancelButtonColor: '#6B7280', // text.secondary del design system
      reverseButtons: true,
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        htmlContainer: 'swal-text',
      },
    });

    return result.isConfirmed;
  };

  /**
   * Muestra un alert personalizado
   */
  const showCustom = (options: AlertOptions): Promise<SweetAlertResult> => {
    return Swal.fire({
      title: options.title,
      text: options.text,
      icon: options.icon || 'info',
      confirmButtonText: options.confirmButtonText || 'Aceptar',
      cancelButtonText: options.cancelButtonText,
      showCancelButton: options.showCancelButton || false,
      confirmButtonColor: '#2F80ED',
      cancelButtonColor: '#6B7280',
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        htmlContainer: 'swal-text',
      },
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    showCustom,
  };
};
