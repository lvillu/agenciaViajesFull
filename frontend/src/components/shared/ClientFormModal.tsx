/**
 * Client Form Modal
 * Modal para agregar/editar clientes
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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
import { DateInput } from '@/components/ui/DateInput';
import { Button } from '@/components/ui/Button';
import { clientSchema, type ClientFormData } from '@/lib/validationSchemas';
import { Client } from '@/types/client';

interface ClientFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => Promise<void>;
  client?: Client | null;
  isLoading?: boolean;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  client,
  isLoading = false,
}) => {
  const isEdit = !!client;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      lastName: '',
      address: '',
      phone: '',
      email: '',
      birthDate: '',
      active: true,
    },
  });

  // Resetear el formulario cuando se abre/cierra o cambia el cliente
  useEffect(() => {
    if (open && client) {
      reset({
        name: client.name,
        lastName: client.lastName,
        address: client.address || '',
        phone: client.phone,
        email: client.email,
        birthDate: client.birthDate || '',
        active: client.active,
      });
    } else if (!open) {
      reset({
        name: '',
        lastName: '',
        address: '',
        phone: '',
        email: '',
        birthDate: '',
        active: true,
      });
    }
  }, [open, client, reset]);

  const handleFormSubmit = async (data: ClientFormData) => {
    await onSubmit(data);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'divider',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          px: 4,
          py: 2.5,
          fontWeight: 800,
          fontSize: '1.1rem',
          borderBottom: '1px solid',
          borderColor: 'divider',
          pr: 6,
        }}
      >
        {isEdit ? 'Editar Cliente' : 'Agregar Cliente'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
            color: 'text.secondary',
            '&:hover': { bgcolor: 'rgba(189, 191, 220, 0.2)' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent sx={{ px: 4, py: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Nombre + Apellido */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Input
                label="Nombre"
                placeholder="Ej. Juan"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
                required
              />
              <Input
                label="Apellido"
                placeholder="Ej. Pérez"
                {...register('lastName')}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                required
              />
            </Box>

            {/* Dirección */}
            <Input
              label="Dirección"
              placeholder="Calle 123, Ciudad"
              {...register('address')}
              error={!!errors.address}
              helperText={errors.address?.message}
            />

            {/* Teléfono + Email */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Input
                label="Teléfono"
                placeholder="+1 234 567 890"
                type="tel"
                {...register('phone')}
                error={!!errors.phone}
                helperText={errors.phone?.message}
                required
              />
              <Input
                label="Email"
                placeholder="juan.perez@email.com"
                type="email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Box>

            {/* Fecha de Nacimiento */}
            <Controller
              name="birthDate"
              control={control}
              render={({ field }) => (
                <DateInput
                  label="Fecha de Nacimiento"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!errors.birthDate}
                  helperText={errors.birthDate?.message}
                />
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 4,
            py: 2,
            gap: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'rgba(189, 191, 220, 0.12)',
          }}
        >
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
