'use client';
import React from 'react';
import { Box, IconButton, FormHelperText, MenuItem, Typography } from '@mui/material';
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
}

export function SaleProvidersField({
  value,
  onChange,
  providers,
  error,
  onProviderSelect,
}: SaleProvidersFieldProps) {
  const handleAddProvider = () => {
    onChange([...value, { providerId: 0, reservationNumber: '' }]);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleProviderChange = (index: number, providerId: number) => {
    const updated = value.map((item, i) =>
      i === index ? { ...item, providerId } : item
    );
    onChange(updated);
    if (onProviderSelect) {
      const found = providers.find((p) => p.id === providerId) ?? null;
      onProviderSelect(found, index);
    }
  };

  const handleReservationChange = (index: number, reservationNumber: string) => {
    const updated = value.map((item, i) =>
      i === index ? { ...item, reservationNumber } : item
    );
    onChange(updated);
  };

  return (
    <Box>
      <Typography
        variant="body2"
        sx={{ mb: 1.5, fontWeight: 600, color: '#525252', fontSize: '0.875rem' }}
      >
        Proveedores
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {value.map((item, index) => (
          <Box
            key={index}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr auto' },
              gap: 2,
              alignItems: 'flex-end',
            }}
          >
            <Input
              label="Proveedor"
              select
              value={item.providerId || ''}
              onChange={(e) => handleProviderChange(index, Number(e.target.value))}
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="" disabled>
                Seleccionar proveedor
              </MenuItem>
              {providers.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.acronym} — {p.name}
                </MenuItem>
              ))}
            </Input>

            <Input
              label="Clave de reserva"
              value={item.reservationNumber ?? ''}
              onChange={(e) => handleReservationChange(index, e.target.value)}
              placeholder="Ej. RES-2024-001"
              InputLabelProps={{ shrink: true }}
            />

            {value.length > 1 && (
              <IconButton
                onClick={() => handleRemove(index)}
                size="small"
                sx={{
                  color: 'text.secondary',
                  borderRadius: 1.5,
                  mb: '2px',
                  '&:hover': { color: 'error.main', bgcolor: '#fee2e2' },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        ))}
      </Box>

      <Button
        variant="text"
        startIcon={<AddIcon />}
        onClick={handleAddProvider}
        type="button"
        sx={{ mt: 1.5, color: '#5BA9B3', fontWeight: 600, px: 0 }}
      >
        Agregar proveedor
      </Button>

      {error && (
        <FormHelperText error sx={{ mt: 0.5 }}>
          {error}
        </FormHelperText>
      )}
    </Box>
  );
}
