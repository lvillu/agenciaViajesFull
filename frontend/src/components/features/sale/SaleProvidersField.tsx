'use client';

import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  FormHelperText,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SaleProviderItem } from '@/types/sale';
import { Provider } from '@/types/provider';

interface SaleProvidersFieldProps {
  value: SaleProviderItem[];
  onChange: (providers: SaleProviderItem[]) => void;
  providers: Provider[];
  error?: string;
  onProviderSelect?: (provider: Provider | null, index: number) => void;
  /** En edición los proveedores no se pueden modificar: oculta el alta y deshabilita eliminar. */
  readOnly?: boolean;
}

/** Conserva solo las claves que el backend acepta (id si venía). */
function toEmittable(item: SaleProviderItem): SaleProviderItem {
  if (item.id !== undefined) {
    return { id: item.id, providerId: item.providerId, reservationNumber: item.reservationNumber ?? '' };
  }
  return { providerId: item.providerId, reservationNumber: item.reservationNumber ?? '' };
}

export function SaleProvidersField({
  value,
  onChange,
  providers,
  error,
  onProviderSelect,
  readOnly = false,
}: SaleProvidersFieldProps) {
  const [draftProviderId, setDraftProviderId] = useState<number | ''>('');
  const [draftKey, setDraftKey] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);

  const providerById = useMemo(() => {
    const map = new Map<number, Provider>();
    for (const p of providers) map.set(p.id, p);
    return map;
  }, [providers]);

  const validEntries = useMemo(
    () =>
      value
        .map((item: SaleProviderItem, originalIndex: number) => ({ item, originalIndex }))
        .filter((entry: { item: SaleProviderItem; originalIndex: number }) => entry.item.providerId > 0),
    [value],
  );

  const addedIds = useMemo(
    () => new Set(validEntries.map((e: { item: SaleProviderItem; originalIndex: number }) => e.item.providerId)),
    [validEntries],
  );

  const countLabel =
    validEntries.length === 1 ? '1 proveedor asociado' : `${validEntries.length} proveedores asociados`;

  const handleAdd = () => {
    if (draftProviderId === '' || draftProviderId === 0) {
      setLocalError('Selecciona un proveedor');
      return;
    }
    if (addedIds.has(draftProviderId)) {
      setLocalError('Ya agregado');
      return;
    }
    const found = providerById.get(draftProviderId) ?? null;
    const newItem: SaleProviderItem = {
      providerId: draftProviderId,
      reservationNumber: draftKey.trim(),
    };
    const kept = value.filter((v) => v.providerId > 0).map(toEmittable);
    const next = [...kept, newItem];
    onChange(next);
    if (onProviderSelect) onProviderSelect(found, next.length - 1);
    setDraftProviderId('');
    setDraftKey('');
    setLocalError(null);
  };

  const handleRemove = (originalIndex: number) => {
    const remaining = value.filter((_, i) => i !== originalIndex);
    const remainingValid = remaining.filter((v) => v.providerId > 0);
    if (remainingValid.length === 0) {
      // El schema Zod exige min 1: reemplazar la última fila por una vacía.
      onChange([{ providerId: 0, reservationNumber: '' }]);
      return;
    }
    onChange(remaining.map(toEmittable));
  };

  const handleDraftProviderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const raw = e.target.value;
    setDraftProviderId(raw === '' ? '' : Number(raw));
    if (localError) setLocalError(null);
  };

  const handleDraftKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraftKey(e.target.value);
  };

  return (
    <Box>
      {/* ── Encabezado ── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 1.5 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <Box
            component="span"
            className="material-symbols-outlined"
            aria-hidden
            sx={{ color: '#EC5B13', fontSize: '20px', lineHeight: 1.3 }}
          >
            auto_awesome
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#525252', lineHeight: 1.3 }}>
              Proveedores del Paquete
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#8B8DA8', mt: 0.25, lineHeight: 1.4 }}>
              Agrega los proveedores del paquete con su clave de confirmación
            </Typography>
          </Box>
        </Box>
        <Box
          component="span"
          sx={{
            flexShrink: 0,
            px: 1.5,
            py: 0.5,
            borderRadius: '999px',
            bgcolor: '#F1F5F9',
            color: '#64748B',
            fontSize: '11px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            mt: 0.25,
          }}
        >
          {countLabel}
        </Box>
      </Box>

      {/* ── Tabla ── */}
      <Box
        sx={{
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          overflow: 'hidden',
          bgcolor: '#FFFFFF',
        }}
      >
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 480 }} size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell
                  sx={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#8B8DA8',
                    borderBottom: '1px solid #E5E7EB',
                    py: 1.25,
                  }}
                >
                  Proveedor
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#8B8DA8',
                    borderBottom: '1px solid #E5E7EB',
                    py: 1.25,
                  }}
                >
                  Clave / Localizador
                </TableCell>
                <TableCell
                  sx={{ width: 48, borderBottom: '1px solid #E5E7EB', py: 1.25 }}
                  align="center"
                >
                  <Box
                    component="span"
                    sx={{
                      position: 'absolute',
                      width: 1,
                      height: 1,
                      overflow: 'hidden',
                      clip: 'rect(0 0 0 0)',
                    }}
                  >
                    Acciones
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {validEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3, borderBottom: 'none' }}>
                    <Typography sx={{ fontSize: '0.8125rem', color: '#8B8DA8' }}>
                      Sin proveedores — agrega el primero abajo
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                validEntries.map(
                  (
                    { item, originalIndex }: { item: SaleProviderItem; originalIndex: number },
                  ) => {
                  const provider = providerById.get(item.providerId) ?? null;
                  const displayName = provider?.name ?? item.providerName ?? '—';
                  const subParts: string[] = [];
                  const acronym = provider?.acronym ?? item.providerAcronym;
                  if (acronym) subParts.push(acronym);
                  if (provider?.providerContactName) subParts.push(provider.providerContactName);
                  const subText = subParts.length > 0 ? subParts.join(' · ') : '—';
                  const key = (item.reservationNumber ?? '').trim();
                  const confirmed = key.length > 0;
                  return (
                    <TableRow
                      key={`${item.providerId}-${originalIndex}`}
                      sx={{ '&:last-child td': { borderBottom: 'none' } }}
                    >
                      <TableCell sx={{ borderBottom: '1px solid #F1F5F9', py: 1.5 }}>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#525252', lineHeight: 1.3 }}>
                          {displayName}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#8B8DA8', lineHeight: 1.4 }}>
                          {subText}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #F1F5F9', py: 1.5 }}>
                        {confirmed ? (
                          <Box
                            component="span"
                            sx={{
                              display: 'inline-block',
                              px: 1,
                              py: 0.5,
                              borderRadius: '6px',
                              bgcolor: '#F1F5F9',
                              color: '#525252',
                              fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
                              fontSize: '12px',
                              fontWeight: 500,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {key}
                          </Box>
                        ) : (
                          <Typography sx={{ fontSize: '0.875rem', color: '#8B8DA8' }}>—</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center" sx={{ borderBottom: '1px solid #F1F5F9', py: 1.5 }}>
                        <IconButton
                          size="small"
                          title={readOnly ? 'Los proveedores no se pueden modificar' : 'Eliminar'}
                          onClick={() => handleRemove(originalIndex)}
                          disabled={readOnly || (validEntries.length <= 1 && value.length <= 1)}
                          sx={{
                            color: '#8B8DA8',
                            borderRadius: 1.5,
                            '&:hover': { color: '#dc2626', bgcolor: '#FEE2E2' },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ── Fila de alta (oculta en modo solo lectura) ── */}
        {!readOnly && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 170px auto' },
            gap: 1.5,
            p: 1.5,
            borderTop: '1px solid #E5E7EB',
            bgcolor: '#FAFBFC',
            alignItems: 'flex-end',
          }}
        >
          <Input
            label="Proveedor"
            select
            value={draftProviderId}
            onChange={handleDraftProviderChange}
            error={!!localError}
            helperText={localError ?? undefined}
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="" disabled>
              Seleccionar Proveedor...
            </MenuItem>
            {providers.map((p) => {
              const already = addedIds.has(p.id);
              return (
                <MenuItem key={p.id} value={p.id} disabled={already}>
                  {p.name} — {p.acronym}
                  {already ? ' (agregado)' : ''}
                </MenuItem>
              );
            })}
          </Input>

          <Input
            label="Clave / Localizador"
            value={draftKey}
            onChange={handleDraftKeyChange}
            placeholder="Ej. VIVA-873"
            InputLabelProps={{ shrink: true }}
          />

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            type="button"
            sx={{ height: 44, whiteSpace: 'nowrap' }}
          >
            Añadir
          </Button>
        </Box>
        )}
      </Box>

      {error && (
        <FormHelperText error sx={{ mt: 1 }}>
          {error}
        </FormHelperText>
      )}
    </Box>
  );
}
