/**
 * Sale Form Page
 * Formulario para crear o editar ventas/reservas
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  MenuItem,
  FormControlLabel,
  FormHelperText,
  Checkbox,
  IconButton,
  Tooltip,
  Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { InputNumber } from 'primereact/inputnumber';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DateInput } from '@/components/ui/DateInput';
import { ClientFormModal } from '@/components/shared/ClientFormModal';
import { saleService } from '@/services/saleService';
import { useClients } from '@/hooks/useClients';
import { useProviders } from '@/hooks/useProviders';
import { useAlert } from '@/hooks/useAlert';
import { formatCurrency } from '@/lib/formatCurrency';
import {
  CreateSaleSchema,
  UpdateSaleSchema,
  type CreateSaleFormData,
  type UpdateSaleFormData,
} from '@/types/sale';
import { Provider } from '@/types/provider';
import { ClientFormData } from '@/lib/validationSchemas';

function SaleFormContent({ saleId: saleIdProp }: { saleId: string | null }) {
  const router = useRouter();
  const saleId = saleIdProp;
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
    resolver: zodResolver(isEditing ? UpdateSaleSchema : CreateSaleSchema) as any,
    defaultValues: {
      clientId: 0,
      providerId: 0,
      reservationNumber: '',
      description: '',
      totalAmount: 0,
      isDollar: false,
      profitPercentage: undefined,
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
  // React Hook Form esta documentado como incompatible con React Compiler;
  // el uso de watch() suscripto a re-renders es el patrón intencional del formulario.
  // eslint-disable-next-line react-hooks/incompatible-library
  const providerId = watch('providerId');
  const travelDate = watch('travelDate');
  const totalAmount = watch('totalAmount');
  const isDollar = watch('isDollar');
  const finalPaymentDueDate = watch('finalPaymentDueDate');
  const profitPercentage = watch('profitPercentage');

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
          setValue('profitPercentage', sale.profitPercentage);
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
      // Pre-cargar % de ganancia del proveedor (solo si no estamos editando)
      if (!isEditing && provider?.profitPercentage !== undefined) {
        setValue('profitPercentage', provider.profitPercentage);
      }
    } else {
      setSelectedProvider(null);
    }
  }, [providerId, providers, isEditing, setValue]);

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
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress sx={{ color: 'primary.main' }} />
        </Box>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <Box sx={{ flex: 1, maxWidth: '896px', mx: 'auto', width: '100%', px: 3, py: 4 }}>
        <Breadcrumbs
          items={[
            { label: 'Reservas', href: '/reservas' },
            { label: isEditing ? 'Editar Reserva' : 'Nueva Reserva' },
          ]}
        />

        {/* Page Title */}
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontSize: '1.875rem', fontWeight: 800, color: '#525252', lineHeight: 1.2 }}>
            {isEditing ? 'Editar Reserva' : 'Crear Nueva Reserva'}
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: '#8B8DA8', mt: 0.5 }}>
            {isEditing
              ? 'Actualiza los datos de la reserva.'
              : 'Completa los datos para registrar el paquete de viaje.'}
          </Typography>
        </Box>

        {submitError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
            {submitError}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* ── Sección 1: Cliente & Proveedor ── */}
            <Box
              sx={{
                bgcolor: '#ffffff',
                border: '1px solid #D8DAEA',
                borderRadius: '12px',
                p: 3,
              }}
            >
              {/* Section header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  pb: 2,
                  mb: 3,
                  borderBottom: '1px solid #D8DAEA',
                }}
              >
                <span className="material-symbols-outlined" style={{ color: '#5BA9B3', fontSize: '20px', lineHeight: 1 }}>
                  handshake
                </span>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#525252' }}>
                  Cliente &amp; Información del Proveedor
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                {/* Cliente + botón agregar */}
                <Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                    <Box sx={{ flex: 1 }}>
                      <Controller
                        name="clientId"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            select
                            label="Seleccionar Cliente"
                            error={!!errors.clientId}
                            helperText={errors.clientId?.message}
                            onChange={(e: any) => field.onChange(Number(e.target.value))}
                          >
                            <MenuItem value={0}>Buscar un cliente...</MenuItem>
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
                        onClick={handleOpenClientModal}
                        sx={{
                          mb: '2px',
                          bgcolor: '#5BA9B3',
                          color: '#ffffff',
                          width: 44,
                          height: 44,
                          borderRadius: '10px',
                          '&:hover': { bgcolor: '#4A969F' },
                          flexShrink: 0,
                        }}
                      >
                        <AddIcon sx={{ fontSize: '20px' }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Proveedor */}
                <Box>
                  <Controller
                    name="providerId"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        select
                        label="Seleccionar Proveedor"
                        error={!!errors.providerId}
                        helperText={errors.providerId?.message}
                        onChange={(e: any) => field.onChange(Number(e.target.value))}
                      >
                        <MenuItem value={0}>Buscar un proveedor...</MenuItem>
                        {providers.map((provider) => (
                          <MenuItem key={provider.id} value={provider.id}>
                            {provider.name} ({provider.acronym})
                          </MenuItem>
                        ))}
                      </Input>
                    )}
                  />
                </Box>
              </Box>
            </Box>

            {/* ── Sección 2: Detalles del Paquete ── */}
            <Box
              sx={{
                bgcolor: '#ffffff',
                border: '1px solid #D8DAEA',
                borderRadius: '12px',
                p: 3,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  pb: 2,
                  mb: 3,
                  borderBottom: '1px solid #D8DAEA',
                }}
              >
                <span className="material-symbols-outlined" style={{ color: '#5BA9B3', fontSize: '20px', lineHeight: 1 }}>
                  inventory_2
                </span>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#525252' }}>
                  Detalles del Paquete
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3, mb: 3 }}>
                {/* Número de Reserva */}
                <Input
                  label="Número de Reserva"
                  placeholder="Ej. RES-2024-001"
                  {...register('reservationNumber')}
                  error={!!errors.reservationNumber}
                  helperText={errors.reservationNumber?.message || 'Proporcionado por el proveedor'}
                />

                {/* Total */}
                <Controller
                  name="totalAmount"
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography
                        component="label"
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: errors.totalAmount ? '#ef4444' : '#525252',
                          mb: 0.75,
                          display: 'block',
                        }}
                      >
                        Monto Total
                      </Typography>
                      <InputNumber
                        value={field.value ?? null}
                        onValueChange={(e) => {
                          field.onChange(e.value ?? 0);
                        }}
                        onBlur={() => {
                          field.onBlur();
                          handleTotalBlur();
                        }}
                        mode="decimal"
                        prefix="$ "
                        useGrouping
                        minFractionDigits={2}
                        maxFractionDigits={2}
                        min={0}
                        unstyled
                        placeholder="$ 0.00"
                        inputStyle={{
                          width: '100%',
                          height: '44px',
                          borderRadius: '8px',
                          padding: '0 12px',
                          fontSize: '14px',
                          fontFamily: '"Public Sans", system-ui, sans-serif',
                          color: '#525252',
                          boxSizing: 'border-box',
                          border: `1px solid ${errors.totalAmount ? '#ef4444' : '#D8DAEA'}`,
                          background: '#ffffff',
                          outline: 'none',
                          transition: 'border-color 0.2s, box-shadow 0.2s',
                        }}
                      />
                      {errors.totalAmount && (
                        <FormHelperText error sx={{ mx: 0, mt: 0.5 }}>
                          {errors.totalAmount.message}
                        </FormHelperText>
                      )}
                    </Box>
                  )}
                />

                {/* Toggle USD */}
                <Box>
                  <Typography
                    sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#525252', mb: 0.75, display: 'block' }}
                  >
                    Moneda (¿USD?)
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      height: '44px',
                    }}
                  >
                    <Controller
                      name="isDollar"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#5BA9B3' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#5BA9B3' },
                          }}
                        />
                      )}
                    />
                    <Typography sx={{ fontSize: '0.875rem', color: '#8B8DA8', fontWeight: 500 }}>
                      {isDollar ? 'USD Activo' : 'MXN'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Descripción */}
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Descripción"
                    multiline
                    rows={4}
                    placeholder="Ingresa detalles de la reserva, solicitudes especiales o notas..."
                    error={!!errors.description}
                    helperText={errors.description?.message || 'Ej: Reserva Paq. Rivera Maya - 3 días, 2 noches'}
                  />
                )}
              />

              {/* % de Ganancia y Valor Ganancia */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Controller
                  name="profitPercentage"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      label="% de Ganancia"
                      type="number"
                      placeholder="10"
                      inputProps={{ step: '0.01', min: '0', max: '100' }}
                      InputProps={{
                        endAdornment: (
                          <Typography sx={{ fontSize: '14px', color: '#ADB0C8', pr: 0.5 }}>%</Typography>
                        ),
                      }}
                      error={!!(errors as any).profitPercentage}
                      helperText={
                        (errors as any).profitPercentage?.message ||
                        (selectedProvider?.profitPercentage !== undefined
                          ? `Precargado del proveedor (${selectedProvider.profitPercentage}%)`
                          : 'Editable por reserva')
                      }
                      onChange={(e: any) => {
                        const val = e.target.value === '' ? undefined : Number(e.target.value);
                        field.onChange(val);
                      }}
                    />
                  )}
                />
                <Box>
                  <Typography
                    sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#525252', mb: 0.75, display: 'block' }}
                  >
                    Valor de Ganancia
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      height: '44px',
                      px: 1.5,
                      bgcolor: 'rgba(189, 191, 220, 0.12)',
                      borderRadius: '8px',
                      border: '1px solid #D8DAEA',
                    }}
                  >
                    <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#16a34a' }}>
                      {profitPercentage && totalAmount > 0
                        ? formatCurrency(totalAmount * profitPercentage / 100, isDollar)
                        : '—'}
                    </Typography>
                    {profitPercentage && totalAmount > 0 && (
                      <Typography sx={{ fontSize: '0.75rem', color: '#8B8DA8', ml: 1 }}>
                        ({profitPercentage}% de {formatCurrency(totalAmount, isDollar)})
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* ── Sección 3: Fechas & Pago ── */}
            <Box
              sx={{
                bgcolor: '#ffffff',
                border: '1px solid #D8DAEA',
                borderRadius: '12px',
                p: 3,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  pb: 2,
                  mb: 3,
                  borderBottom: '1px solid #D8DAEA',
                }}
              >
                <span className="material-symbols-outlined" style={{ color: '#5BA9B3', fontSize: '20px', lineHeight: 1 }}>
                  event
                </span>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#525252' }}>
                  Fechas &amp; Pago
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3, mb: 3 }}>
                {/* Fecha de Viaje */}
                <Controller
                  name="travelDate"
                  control={control}
                  render={({ field }) => (
                    <DateInput
                      label="Fecha de Viaje"
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        // Calcular fecha de liquidación automáticamente
                        if (selectedProvider && val && selectedProvider.finalPaymentDaysBefore) {
                          const calculatedDate = saleService.calculateFinalPaymentDate(
                            val,
                            selectedProvider.finalPaymentDaysBefore
                          );
                          if (calculatedDate) setValue('finalPaymentDueDate', calculatedDate);
                        }
                      }}
                      onBlur={field.onBlur}
                      error={!!errors.travelDate}
                      helperText={(errors.travelDate as any)?.message}
                      minDate={new Date()}
                      required
                    />
                  )}
                />

                {/* Fecha de Retorno */}
                <Controller
                  name="returnDate"
                  control={control}
                  render={({ field }) => (
                    <DateInput
                      label="Fecha de Retorno"
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={!!errors.returnDate}
                      helperText={(errors.returnDate as any)?.message || 'Opcional: Para avisar al vendedor'}
                      minDate={travelDate ? new Date(travelDate + 'T00:00:00') : new Date()}
                    />
                  )}
                />

                {/* Fecha Límite de Liquidación */}
                <Box>
                  <Controller
                    name="finalPaymentDueDate"
                    control={control}
                    render={({ field }) => (
                      <DateInput
                        label="Fecha Límite de Liquidación"
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={!!errors.finalPaymentDueDate || isLiquidationOverdue}
                        helperText={
                          (errors.finalPaymentDueDate as any)?.message ||
                          (selectedProvider?.finalPaymentDaysBefore
                            ? `Auto: ${selectedProvider.finalPaymentDaysBefore} días antes`
                            : 'Opcional: Ajustable manualmente')
                        }
                        maxDate={travelDate ? new Date(travelDate + 'T00:00:00') : undefined}
                      />
                    )}
                  />
                  {isLiquidationOverdue && (
                    <Alert
                      severity="warning"
                      icon={<WarningAmberIcon />}
                      sx={{ mt: 1, borderRadius: '8px', fontSize: '0.8rem' }}
                    >
                      La fecha ya pasó. El Pago Inicial debe cubrir el 100%.
                    </Alert>
                  )}
                </Box>
              </Box>

              {/* Pago Inicial (solo creación) + Tipo de Cambio */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                {!isEditing && (
                  <Input
                    label="Pago Inicial"
                    type="number"
                    placeholder="0.00"
                    inputProps={{ step: '0.01', min: '0' }}
                    {...register('requiredDeposit', { valueAsNumber: true })}
                    error={!!errors.requiredDeposit}
                    helperText={
                      (errors.requiredDeposit as any)?.message ||
                      (selectedProvider?.depositPercentage
                        ? `Calculado automáticamente (${selectedProvider.depositPercentage}%)`
                        : 'Opcional: Se puede calcular automáticamente')
                    }
                  />
                )}
                {isDollar && (
                  <Input
                    label="Tipo de Cambio (USD a MXN)"
                    type="number"
                    placeholder="Ej. 20.50"
                    inputProps={{ step: '0.01', min: '0' }}
                    {...register('exchangeRate', { valueAsNumber: true })}
                    error={!!errors.exchangeRate}
                    helperText={errors.exchangeRate?.message || 'Ejemplo: 20.50'}
                    required
                  />
                )}
              </Box>

              {/* Activo (solo edición) */}
              {isEditing && (
                <Box sx={{ mt: 3 }}>
                  <Controller
                    name="active"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            sx={{ color: '#D8DAEA', '&.Mui-checked': { color: '#5BA9B3' } }}
                          />
                        }
                        label={
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#525252' }}>
                            Reserva activa
                          </Typography>
                        }
                      />
                    )}
                  />
                </Box>
              )}
            </Box>

            {/* ── Botones de acción ── */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 1 }}>
              <Button onClick={handleCancel} variant="outlined" disabled={loading}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={
                  loading ? undefined : (
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>save</span>
                  )
                }
              >
                {loading ? (
                  <CircularProgress size={22} sx={{ color: '#fff' }} />
                ) : isEditing ? (
                  'Actualizar Reserva'
                ) : (
                  'Crear Reserva'
                )}
              </Button>
            </Box>

          </Box>
        </form>
      </Box>

      {/* Modal para agregar cliente */}
      <ClientFormModal
        open={clientModalOpen}
        onClose={handleCloseClientModal}
        onSubmit={handleCreateClient}
        isLoading={clientsLoading}
      />

      <Footer />
    </Box>
  );
}

/**
 * Controlador que lee searchParams y fuerza remonte del formulario
 * mediante key cuando cambia el saleId (navegación crear ↔ editar)
 */
function SaleFormController() {
  const searchParams = useSearchParams();
  const saleId = searchParams.get('id');
  return <SaleFormContent key={saleId || 'create'} saleId={saleId} />;
}

export default function SaleFormPage() {
  return (
    <Suspense fallback={
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress sx={{ color: 'primary.main' }} />
        </Box>
        <Footer />
      </Box>
    }>
      <SaleFormController />
    </Suspense>
  );
}
