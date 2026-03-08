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
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ClientFormModal } from '@/components/shared/ClientFormModal';
import { saleService } from '@/services/saleService';
import { useClients } from '@/hooks/useClients';
import { useProviders } from '@/hooks/useProviders';
import { useAlert } from '@/hooks/useAlert';
import {
  CreateSaleSchema,
  UpdateSaleSchema,
  type CreateSaleFormData,
  type UpdateSaleFormData,
} from '@/types/sale';
import { Provider } from '@/types/provider';
import { ClientFormData } from '@/lib/validationSchemas';

function SaleFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const saleId = searchParams.get('id');
  const isEditing = !!saleId;

  const [loading, setLoading] = useState(false);
  const [loadingSale, setLoadingSale] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [isLiquidationOverdue, setIsLiquidationOverdue] = useState(false);

  const { clients, createClient, loading: clientsLoading } = useClients();
  const { providers } = useProviders();
  const { showSuccess, showError } = useAlert();

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
      exchangeRate: undefined,
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
  const isDollar = watch('isDollar');
  const finalPaymentDueDate = watch('finalPaymentDueDate');

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
          setValue('exchangeRate', sale.exchangeRate);
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

  // Verificar si la fecha de liquidación es pasada
  useEffect(() => {
    if (finalPaymentDueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
      const dueDate = new Date(finalPaymentDueDate);
      dueDate.setHours(0, 0, 0, 0);
      setIsLiquidationOverdue(dueDate < today);
    } else {
      setIsLiquidationOverdue(false);
    }
  }, [finalPaymentDueDate]);

  // Handler para calcular pago inicial cuando el total pierde el foco
  const handleTotalBlur = () => {
    if (selectedProvider && totalAmount > 0 && selectedProvider.depositPercentage) {
      const calculatedDeposit = saleService.calculateRequiredDeposit(
        totalAmount,
        selectedProvider.depositPercentage
      );
      if (calculatedDeposit !== null && calculatedDeposit !== undefined) {
        setValue('requiredDeposit', calculatedDeposit);
      }
    }
  };

  // Handler para calcular fecha de liquidación cuando cambia la fecha de viaje
  const handleTravelDateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newTravelDate = e.target.value;
    
    if (selectedProvider && newTravelDate && selectedProvider.finalPaymentDaysBefore) {
      const calculatedDate = saleService.calculateFinalPaymentDate(
        newTravelDate,
        selectedProvider.finalPaymentDaysBefore
      );
      if (calculatedDate) {
        setValue('finalPaymentDueDate', calculatedDate);
      }
    }
  };

  // Formatear moneda para mostrar
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Handlers para el modal de cliente
  const handleOpenClientModal = () => {
    setClientModalOpen(true);
  };

  const handleCloseClientModal = () => {
    setClientModalOpen(false);
  };

  const handleCreateClient = async (data: ClientFormData) => {
    try {
      const newClient = await createClient(data);
      if (newClient) {
        handleCloseClientModal();
        // Auto-seleccionar el cliente recién creado
        setValue('clientId', newClient.id);
        await showSuccess('Cliente creado exitosamente');
      }
    } catch (err: any) {
      await showError(err.message || 'Error al crear cliente');
      throw err; // Re-lanzar el error para que el modal no se cierre
    }
  };

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
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Container maxWidth="xl" sx={{ py: 4, flex: 1, px: { xs: 2, sm: 3, lg: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Container maxWidth="xl" sx={{ py: 4, flex: 1, px: { xs: 2, sm: 3, lg: 4 } }}>
        <Breadcrumbs
          items={[
            { label: 'Reservas', href: '/reservas' },
            { label: isEditing ? 'Editar Reserva' : 'Nueva Reserva' },
          ]}
        />
        <Typography variant="h1" sx={{ mb: 3, color: 'text.primary', fontWeight: 800 }}>
          {isEditing ? 'Editar Reserva' : 'Nueva Reserva'}
        </Typography>

        <Card
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
            my: 2,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {submitError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {submitError}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                {/* Cliente con botón para agregar */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
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
                    </Box>
                    <Tooltip title="Agregar nuevo cliente">
                      <IconButton
                        color="primary"
                        onClick={handleOpenClientModal}
                        sx={{
                          mt: 1.5,
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                          },
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>

                {/* Botón Agregar Cliente */}
                <Grid item xs={12} md={6}>
                  <Button 
                    onClick={handleOpenClientModal} 
                    variant="outlined" 
                    color="primary"
                    startIcon={<AddIcon />}
                    sx={{ mt: 1 }}
                  >
                    Agregar Cliente
                  </Button>
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
                  <Controller
                    name="totalAmount"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Total de la Reserva"
                        type="number"
                        inputProps={{ step: '0.01', min: '0' }}
                        error={!!errors.totalAmount}
                        helperText={
                          errors.totalAmount?.message ||
                          (field.value > 0 ? `Equivale a: ${formatCurrency(field.value)}` : '')
                        }
                        onBlur={handleTotalBlur}
                      />
                    )}
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

                {/* Tipo de Cambio (solo si es en dólares) */}
                {isDollar && (
                  <Grid item xs={12} md={6}>
                    <Input
                      label="Tipo de Cambio (USD a MXN)"
                      type="number"
                      inputProps={{ step: '0.01', min: '0' }}
                      {...register('exchangeRate', { valueAsNumber: true })}
                      error={!!errors.exchangeRate}
                      helperText={errors.exchangeRate?.message || 'Ejemplo: 20.50'}
                      required
                    />
                  </Grid>
                )}

                {/* Pago Inicial (renombrado de "Anticipo Requerido") */}
                <Grid item xs={12} md={6}>
                  <Input
                    label="Pago Inicial"
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
                  <Controller
                    name="travelDate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Fecha de Viaje"
                        type="date"
                        inputProps={{
                          min: new Date().toISOString().split('T')[0],
                        }}
                        onChange={(e) => {
                          field.onChange(e);
                          handleTravelDateChange(e);
                        }}
                        error={!!errors.travelDate}
                        helperText={errors.travelDate?.message}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </Grid>

                {/* Fecha de Retorno */}
                <Grid item xs={12} md={6}>
                  <Input
                    label="Fecha de Retorno"
                    type="date"
                    inputProps={{
                      min: travelDate || new Date().toISOString().split('T')[0],
                    }}
                    {...register('returnDate')}
                    error={!!errors.returnDate}
                    helperText={errors.returnDate?.message || 'Opcional: Para avisar al vendedor'}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Fecha Límite de Liquidación */}
                <Grid item xs={12} md={6}>
                  <Input
                    label="Fecha Límite de Liquidación"
                    type="date"
                    inputProps={{
                      max: travelDate || undefined,
                    }}
                    {...register('finalPaymentDueDate')}
                    error={!!errors.finalPaymentDueDate}
                    helperText={
                      errors.finalPaymentDueDate?.message ||
                      (selectedProvider?.finalPaymentDaysBefore
                        ? `Calculado automáticamente (${selectedProvider.finalPaymentDaysBefore} días antes)`
                        : 'Opcional: Ajustable manualmente')
                    }
                    InputLabelProps={{ shrink: true }}
                    disabled={isLiquidationOverdue}
                  />
                  {isLiquidationOverdue && (
                    <Alert 
                      severity="warning" 
                      icon={<WarningAmberIcon />}
                      sx={{ mt: 1 }}
                    >
                      La fecha de liquidación ya pasó. El Pago Inicial debe cubrir el 100% del paquete.
                    </Alert>
                  )}
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
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  disabled={loading}
                  sx={{ minWidth: 140 }}
                >
                  {loading ? <CircularProgress size={24} /> : isEditing ? 'Actualizar' : 'Crear Reserva'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>

        {/* Modal para agregar cliente */}
        <ClientFormModal
          open={clientModalOpen}
          onClose={handleCloseClientModal}
          onSubmit={handleCreateClient}
          isLoading={clientsLoading}
        />
      </Container>
      <Footer />
    </Box>
  );
}

export default function SaleFormPage() {
  return (
    <Suspense fallback={
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Container maxWidth="xl" sx={{ py: 4, flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
        <Footer />
      </Box>
    }>
      <SaleFormContent />
    </Suspense>
  );
}
