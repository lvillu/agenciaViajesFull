/**
 * Sale Form Page
 * Formulario para crear o editar ventas/reservas
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Header } from '@/components/shared/Header';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { saleService } from '@/services/saleService';
import { useClients } from '@/hooks/useClients';
import { useProviders } from '@/hooks/useProviders';
import {
  CreateSaleSchema,
  UpdateSaleSchema,
  type CreateSaleFormData,
  type UpdateSaleFormData,
} from '@/types/sale';
import { Provider } from '@/types/provider';

function SaleFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const saleId = searchParams.get('id');
  const isEditing = !!saleId;

  const [loading, setLoading] = useState(false);
  const [loadingSale, setLoadingSale] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  const { clients } = useClients();
  const { providers } = useProviders();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateSaleFormData | UpdateSaleFormData>({
    resolver: zodResolver(isEditing ? UpdateSaleSchema : CreateSaleSchema),
    defaultValues: {
      clientId: 0,
      providerId: 0,
      reservationNumber: '',
      description: '',
      totalAmount: 0,
      isDollar: false,
      requiredDeposit: undefined,
      finalPaymentDueDate: undefined,
      travelDate: '',
      returnDate: undefined,
      status: 'Pendiente',
      active: true,
    },
  });

  // Observar cambios en campos para cálculos automáticos
  const providerId = watch('providerId');
  const travelDate = watch('travelDate');
  const totalAmount = watch('totalAmount');

  // Cargar venta si está editando
  useEffect(() => {
    if (isEditing && saleId) {
      setLoadingSale(true);
      saleService
        .getById(Number(saleId))
        .then((sale) => {
          setValue('clientId', sale.clientId);
          setValue('providerId', sale.providerId);
          setValue('reservationNumber', sale.reservationNumber || '');
          setValue('description', sale.description || '');
          setValue('totalAmount', sale.totalAmount);
          setValue('isDollar', sale.isDollar);
          setValue('requiredDeposit', sale.requiredDeposit);
          setValue('finalPaymentDueDate', sale.finalPaymentDueDate || undefined);
          setValue('travelDate', sale.travelDate);
          setValue('returnDate', sale.returnDate || undefined);
          setValue('status', sale.status || 'Pendiente');
          setValue('active', sale.active);
        })
        .catch((err) => {
          setSubmitError(err.message || 'Error al cargar la venta');
        })
        .finally(() => {
          setLoadingSale(false);
        });
    }
  }, [isEditing, saleId, setValue]);

  // Actualizar proveedor seleccionado cuando cambie providerId
  useEffect(() => {
    if (providerId > 0) {
      const provider = providers.find((p) => p.id === providerId);
      setSelectedProvider(provider || null);
    } else {
      setSelectedProvider(null);
    }
  }, [providerId, providers]);

  // Calcular fecha de liquidación automáticamente
  useEffect(() => {
    if (selectedProvider && travelDate && selectedProvider.finalPaymentDaysBefore) {
      const calculatedDate = saleService.calculateFinalPaymentDate(
        travelDate,
        selectedProvider.finalPaymentDaysBefore
      );
      if (calculatedDate) {
        setValue('finalPaymentDueDate', calculatedDate);
      }
    }
  }, [selectedProvider, travelDate, setValue]);

  // Calcular anticipo requerido automáticamente
  useEffect(() => {
    if (selectedProvider && totalAmount > 0 && selectedProvider.depositPercentage) {
      const calculatedDeposit = saleService.calculateRequiredDeposit(
        totalAmount,
        selectedProvider.depositPercentage
      );
      if (calculatedDeposit) {
        setValue('requiredDeposit', calculatedDeposit);
      }
    }
  }, [selectedProvider, totalAmount, setValue]);

  const onSubmit = async (data: CreateSaleFormData | UpdateSaleFormData) => {
    setSubmitError(null);
    setLoading(true);

    try {
      if (isEditing && saleId) {
        await saleService.update(Number(saleId), data as UpdateSaleFormData);
      } else {
        await saleService.create(data as CreateSaleFormData);
      }

      router.push('/reservas');
    } catch (err: any) {
      setSubmitError(err.message || 'Error al guardar la venta');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/reservas');
  };

  if (loadingSale) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumbs
          items={[
            { label: 'Reservas', href: '/reservas' },
            { label: isEditing ? 'Editar Reserva' : 'Nueva Reserva' },
          ]}
        />
        <Typography variant="h1" sx={{ mb: 3, color: 'text.primary' }}>
          {isEditing ? 'Editar Reserva' : 'Nueva Reserva'}
        </Typography>

        <Card elevation={0}>
          <CardContent>
            {submitError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {submitError}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                {/* Cliente */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="clientId"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        select
                        label="Cliente"
                        error={!!errors.clientId}
                        helperText={errors.clientId?.message}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      >
                        <MenuItem value={0}>Seleccione un cliente</MenuItem>
                        {clients.map((client) => (
                          <MenuItem key={client.id} value={client.id}>
                            {client.name} {client.lastName}
                          </MenuItem>
                        ))}
                      </Input>
                    )}
                  />
                </Grid>

                {/* Proveedor */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="providerId"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        select
                        label="Proveedor"
                        error={!!errors.providerId}
                        helperText={errors.providerId?.message}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      >
                        <MenuItem value={0}>Seleccione un proveedor</MenuItem>
                        {providers.map((provider) => (
                          <MenuItem key={provider.id} value={provider.id}>
                            {provider.name} ({provider.acronym})
                          </MenuItem>
                        ))}
                      </Input>
                    )}
                  />
                </Grid>

                {/* Número de Reserva */}
                <Grid item xs={12} md={6}>
                  <Input
                    label="Número de Reserva"
                    {...register('reservationNumber')}
                    error={!!errors.reservationNumber}
                    helperText={errors.reservationNumber?.message || 'Proporcionado por el proveedor'}
                  />
                </Grid>

                {/* Total */}
                <Grid item xs={12} md={6}>
                  <Input
                    label="Total de la Reserva"
                    type="number"
                    inputProps={{ step: '0.01', min: '0' }}
                    {...register('totalAmount', { valueAsNumber: true })}
                    error={!!errors.totalAmount}
                    helperText={errors.totalAmount?.message}
                  />
                </Grid>

                {/* Descripción */}
                <Grid item xs={12}>
                  <Input
                    label="Descripción del Paquete"
                    multiline
                    rows={3}
                    {...register('description')}
                    error={!!errors.description}
                    helperText={errors.description?.message || 'Ej: Reserva Paq. Rivera Maya - 3 días, 2 noches'}
                  />
                </Grid>

                {/* Es Dólares */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="isDollar"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        }
                        label="¿La reserva es en dólares?"
                      />
                    )}
                  />
                </Grid>

                {/* Anticipo Requerido */}
                <Grid item xs={12} md={6}>
                  <Input
                    label="Anticipo Requerido"
                    type="number"
                    inputProps={{ step: '0.01', min: '0' }}
                    {...register('requiredDeposit', { valueAsNumber: true })}
                    error={!!errors.requiredDeposit}
                    helperText={
                      errors.requiredDeposit?.message ||
                      (selectedProvider?.depositPercentage
                        ? `Calculado automáticamente (${selectedProvider.depositPercentage}%)`
                        : 'Opcional: Se puede calcular automáticamente')
                    }
                  />
                </Grid>

                {/* Fecha de Viaje */}
                <Grid item xs={12} md={6}>
                  <Input
                    label="Fecha de Viaje"
                    type="date"
                    {...register('travelDate')}
                    error={!!errors.travelDate}
                    helperText={errors.travelDate?.message}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Fecha de Retorno */}
                <Grid item xs={12} md={6}>
                  <Input
                    label="Fecha de Retorno"
                    type="date"
                    {...register('returnDate')}
                    error={!!errors.returnDate}
                    helperText={errors.returnDate?.message || 'Opcional: Para avisar al vendedor'}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Fecha Límite de Pago */}
                <Grid item xs={12} md={6}>
                  <Input
                    label="Fecha Límite de Liquidación"
                    type="date"
                    {...register('finalPaymentDueDate')}
                    error={!!errors.finalPaymentDueDate}
                    helperText={
                      errors.finalPaymentDueDate?.message ||
                      (selectedProvider?.finalPaymentDaysBefore
                        ? `Calculado automáticamente (${selectedProvider.finalPaymentDaysBefore} días antes)`
                        : 'Opcional: Ajustable manualmente')
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Estado */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} select label="Estado">
                        <MenuItem value="Pendiente">Pendiente</MenuItem>
                        <MenuItem value="Pagado Parcialmente">Pagado Parcialmente</MenuItem>
                        <MenuItem value="Liquidado">Liquidado</MenuItem>
                        <MenuItem value="Cancelado">Cancelado</MenuItem>
                      </Input>
                    )}
                  />
                </Grid>

                {/* Activo (solo en edición) */}
                {isEditing && (
                  <Grid item xs={12}>
                    <Controller
                      name="active"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          }
                          label="Reserva activa"
                        />
                      )}
                    />
                  </Grid>
                )}
              </Grid>

              {/* Botones */}
              <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
                <Button onClick={handleCancel} variant="outlined" disabled={loading}>
                  Cancelar
                </Button>
                <Button type="submit" variant="contained" color="primary" disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : isEditing ? 'Actualizar' : 'Crear Reserva'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default function SaleFormPage() {
  return (
    <Suspense fallback={
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
      </Box>
    }>
      <SaleFormContent />
    </Suspense>
  );
}
