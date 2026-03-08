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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
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
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          px: 3,
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
            '&:hover': { bgcolor: '#f1f5f9' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent sx={{ px: 3, py: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Input
              label="Nombre"
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
              required
            />

            <Input
              label="Apellido"
              {...register('lastName')}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              required
            />

            <Input
              label="Dirección"
              {...register('address')}
              error={!!errors.address}
              helperText={errors.address?.message}
            />

            <Input
              label="Teléfono"
              {...register('phone')}
              error={!!errors.phone}
              helperText={errors.phone?.message}
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
              label="Fecha de Nacimiento"
              type="date"
              {...register('birthDate')}
              error={!!errors.birthDate}
              helperText={errors.birthDate?.message}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            gap: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: '#f8fafc',
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
