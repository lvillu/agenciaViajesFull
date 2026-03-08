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
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ContactMailOutlinedIcon from '@mui/icons-material/ContactMailOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
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

const SectionHeader = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5, color: '#ec5b13' }}>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>{icon}</Box>
    <Typography
      sx={{
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#ec5b13',
      }}
    >
      {label}
    </Typography>
  </Box>
);

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
      depositPercentage: undefined,
      finalPaymentDaysBefore: undefined,
      profitPercentage: undefined,
      active: true,
    },
  });

  useEffect(() => {
    if (open && provider) {
      reset({
        name: provider.name,
        acronym: provider.acronym,
        email: provider.email,
        phone: provider.phone,
        providerContactName: provider.providerContactName,
        depositPercentage: provider.depositPercentage,
        finalPaymentDaysBefore: provider.finalPaymentDaysBefore,
        profitPercentage: provider.profitPercentage,
        active: provider.active,
      });
    } else if (!open) {
      reset({
        name: '',
        acronym: '',
        email: '',
        phone: '',
        providerContactName: '',
        depositPercentage: undefined,
        finalPaymentDaysBefore: undefined,
        profitPercentage: undefined,
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
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          minHeight: '620px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          m: 0,
          px: 4,
          py: 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          pr: 6,
        }}
      >
        <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: 'text.primary', lineHeight: 1.3 }}>
          {isEdit ? 'Editar Proveedor' : 'Agregar Proveedor'}
        </Typography>
        <Typography sx={{ fontSize: '13px', color: 'text.secondary', mt: 0.5 }}>
          {isEdit
            ? 'Actualiza los datos del proveedor de servicio'
            : 'Ingresa los datos del nuevo proveedor de servicio'}
        </Typography>
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

      <form onSubmit={handleSubmit(handleFormSubmit)} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <DialogContent sx={{ px: 4, py: 3, display: 'flex', flexDirection: 'column', gap: 3.5, overflowY: 'auto', flex: 1 }}>

          {/* Sección: Información Básica */}
          <Box>
            <SectionHeader
              icon={<InfoOutlinedIcon sx={{ fontSize: 15 }} />}
              label="Información Básica"
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2 }}>
              <Input
                label="Nombre del Proveedor"
                placeholder="Ej. Skyline Airways"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
                required
              />
              <Input
                label="Acrónimo"
                placeholder="SA"
                {...register('acronym')}
                error={!!errors.acronym}
                helperText={errors.acronym?.message}
                required
              />
            </Box>
          </Box>

          {/* Sección: Datos de Contacto */}
          <Box>
            <SectionHeader
              icon={<ContactMailOutlinedIcon sx={{ fontSize: 15 }} />}
              label="Datos de Contacto"
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Input
                  label="Persona de Contacto"
                  placeholder="Nombre completo"
                  {...register('providerContactName')}
                  error={!!errors.providerContactName}
                  helperText={errors.providerContactName?.message}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="contacto@proveedor.com"
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  required
                />
              </Box>
              <Input
                label="Teléfono"
                placeholder="+1 (555) 000-0000"
                {...register('phone')}
                error={!!errors.phone}
                helperText={errors.phone?.message}
                required
              />
            </Box>
          </Box>

          {/* Sección: Términos de Pago */}
          <Box>
            <SectionHeader
              icon={<PaymentsOutlinedIcon sx={{ fontSize: 15 }} />}
              label="Términos de Pago y Ganancia"
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
              <Input
                label="Porcentaje de Anticipo"
                type="number"
                placeholder="25"
                {...register('depositPercentage', { valueAsNumber: true })}
                error={!!errors.depositPercentage}
                helperText={errors.depositPercentage?.message}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                InputProps={{
                  endAdornment: (
                    <Typography sx={{ fontSize: '14px', color: 'text.secondary', pr: 0.5 }}>%</Typography>
                  ),
                }}
              />
              <Input
                label="Días para Pago Final"
                type="number"
                placeholder="30"
                {...register('finalPaymentDaysBefore', { valueAsNumber: true })}
                error={!!errors.finalPaymentDaysBefore}
                helperText={errors.finalPaymentDaysBefore?.message}
                inputProps={{ min: 0, step: 1 }}
                InputProps={{
                  endAdornment: (
                    <Typography sx={{ fontSize: '12px', color: 'text.secondary', pr: 0.5 }}>días</Typography>
                  ),
                }}
              />
              <Input
                label="% de Ganancia"
                type="number"
                placeholder="10"
                {...register('profitPercentage', { valueAsNumber: true })}
                error={!!errors.profitPercentage}
                helperText={errors.profitPercentage?.message || 'Precargado en reservas'}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                InputProps={{
                  endAdornment: (
                    <Typography sx={{ fontSize: '14px', color: 'text.secondary', pr: 0.5 }}>%</Typography>
                  ),
                }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 4,
            py: 2.5,
            gap: 1.5,
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
            startIcon={<SaveOutlinedIcon sx={{ fontSize: 16 }} />}
          >
            {isEdit ? 'Actualizar Proveedor' : 'Guardar Proveedor'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
