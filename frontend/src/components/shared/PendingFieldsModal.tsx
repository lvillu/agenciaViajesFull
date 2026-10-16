/**
 * PendingFieldsModal
 * Modal que lista los campos pendientes de capturar cuando el formulario
 * de reserva no pasa validación (ej. sin proveedor agregado).
 */

'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ErrorIcon from '@mui/icons-material/Error';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import { Button } from '@/components/ui/Button';
import type { PendingField } from '@/lib/saleSubmit';

interface PendingFieldsModalProps {
  open: boolean;
  onClose: () => void;
  pendingFields: PendingField[];
  /** Muestra el CTA para agregar un proveedor (cuando falta el proveedor). */
  showAddProviderAction?: boolean;
  onAddProvider?: () => void;
}

export const PendingFieldsModal: React.FC<PendingFieldsModalProps> = ({
  open,
  onClose,
  pendingFields,
  showAddProviderAction = false,
  onAddProvider,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          },
        },
      }}
    >
      <DialogTitle sx={{ m: 0, px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider', pr: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '10px',
              bgcolor: 'rgba(236, 91, 19, 0.1)',
              color: '#EC5B13',
            }}
          >
            <ErrorIcon />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: 'text.primary', lineHeight: 1.3 }}>
              Campos pendientes
            </Typography>
            <Typography sx={{ fontSize: '13px', color: 'text.secondary', mt: 0.25 }}>
              {pendingFields.length === 1
                ? 'Falta 1 campo por capturar'
                : `Faltan ${pendingFields.length} campos por capturar`}
            </Typography>
          </Box>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 12, top: 12, color: 'text.secondary' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <List dense disablePadding>
          {pendingFields.map((field) => (
            <ListItem key={field.key} disableGutters sx={{ py: 1, alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: 32, mt: 0.25, color: '#EC5B13' }}>
                <ErrorIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#525252' }}>
                    {field.label}
                  </Typography>
                }
                secondary={
                  <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                    {field.message}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>

        {showAddProviderAction && (
          <Box
            sx={{
              mt: 1.5,
              p: 2,
              borderRadius: '10px',
              border: '1px dashed #EC5B13',
              bgcolor: 'rgba(236, 91, 19, 0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <PersonAddAltOutlinedIcon sx={{ color: '#EC5B13' }} />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#525252' }}>
                ¿No encuentras el proveedor?
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                Créalo aquí mismo sin salir del formulario.
              </Typography>
            </Box>
            <Button variant="contained" color="primary" onClick={onAddProvider} sx={{ whiteSpace: 'nowrap' }}>
              Agregar proveedor
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} variant="contained" color="primary" fullWidth>
          Revisar campos
        </Button>
      </DialogActions>
    </Dialog>
  );
};
