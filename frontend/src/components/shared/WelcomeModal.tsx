/**
 * WelcomeModal
 * Modal de bienvenida para que el owner configure el folio inicial por primera vez.
 * Se muestra cuando folioStart === 0 y es obligatorio completar el setup.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Box,
  Alert,
} from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { useAuth } from '@/hooks/useAuth';

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ open, onClose }) => {
  const { setFolioStart, loading } = useAuth();
  const [folioValue, setFolioValue] = useState<number>(1);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reset state cada vez que se abre el modal
  useEffect(() => {
    if (open) {
      setFolioValue(1);
      setFieldError(null);
      setSubmitError(null);
    }
  }, [open]);

  const handleSave = async () => {
    // Validación local
    if (!folioValue || folioValue < 1) {
      setFieldError('El valor debe ser mayor o igual a 1');
      return;
    }

    setFieldError(null);
    setSubmitError(null);

    try {
      await setFolioStart({ folioStart: folioValue });
      // Éxito → cerrar modal
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error al configurar el folio inicial';
      setSubmitError(message);
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: { cursor: 'default' },
        },
        paper: {
          sx: {
            p: 0,
          },
        },
      }}
    >
      {/* Icono decorativo + título */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: 4,
          pb: 1,
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '16px',
            bgcolor: 'primary.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <FlightTakeoffIcon sx={{ fontSize: 36, color: 'primary.main' }} />
        </Box>
        <Typography
          variant="h2"
          sx={{ textAlign: 'center', color: 'text.primary' }}
        >
          ¡Bienvenido a Ibarra Travel!
        </Typography>
      </Box>

      <DialogContent sx={{ px: 3, pb: 1 }}>
        <Typography
          variant="body1"
          sx={{ textAlign: 'center', color: 'text.secondary', mb: 3, px: 2 }}
        >
          Para comenzar a operar, necesitas configurar el número de folio inicial
          para tus pagos. Este número se incrementará automáticamente con cada
          nuevo pago registrado.
        </Typography>

        <TextField
          label="Folio inicial"
          type="number"
          fullWidth
          value={folioValue}
          onChange={(e) => {
            const raw = e.target.value;
            const parsed = parseInt(raw, 10);
            setFolioValue(isNaN(parsed) ? 0 : parsed);
            if (fieldError) setFieldError(null);
          }}
          error={!!fieldError}
          helperText={fieldError || 'El folio inicial por defecto es 1'}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { min: 1 },
          }}
          sx={{ mb: 1 }}
        />

        {submitError && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: 1 }}>
            {submitError}
          </Alert>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSave}
          disabled={loading}
          sx={{
            px: 6,
            py: 1.5,
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: 'primary.contrastText' }} />
          ) : (
            'Guardar configuración'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
