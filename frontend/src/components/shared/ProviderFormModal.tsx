/**
 * Provider Form Modal
 * Modal para agregar/editar proveedores
 */

'use client';

import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { providerSchema, type ProviderFormData } from '@/lib/validationSchemas';
import { Provider } from '@/types/provider';

interface ProviderFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProviderFormData) => Promise<void>;
  provider?: Provider | null;
  isLoading?: boolean;
}

export const ProviderFormModal: React.FC<ProviderFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  provider,
  isLoading = false,
}) => {
  const isEdit = !!provider;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      name: '',
      acronym: '',
      email: '',
      phone: '',
      providerContactName: '',
      active: true,
    },
  });

  // Resetear el formulario cuando se abre/cierra o cambia el proveedor
  useEffect(() => {
    if (open && provider) {
      reset({
        name: provider.name,
        acronym: provider.acronym,
        email: provider.email,
        phone: provider.phone,
        providerContactName: provider.providerContactName,
        active: provider.active,
      });
    } else if (!open) {
      reset({
        name: '',
        acronym: '',
        email: '',
        phone: '',
        providerContactName: '',
        active: true,
      });
    }
  }, [open, provider, reset]);

  const handleFormSubmit = async (data: ProviderFormData) => {
    await onSubmit(data);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, pr: 6 }}>
        {isEdit ? 'Editar Proveedor' : 'Agregar Proveedor'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Input
              label="Nombre"
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
              required
            />

            <Input
              label="Acrónimo"
              {...register('acronym')}
              error={!!errors.acronym}
              helperText={errors.acronym?.message}
              required
            />

            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              required
            />

            <Input
              label="Teléfono"
              {...register('phone')}
              error={!!errors.phone}
              helperText={errors.phone?.message}
              required
            />

            <Input
              label="Nombre de Contacto"
              {...register('providerContactName')}
              error={!!errors.providerContactName}
              helperText={errors.providerContactName?.message}
              required
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            color="inherit"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            isLoading={isLoading}
          >
            {isEdit ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
