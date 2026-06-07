/**
 * AvatarUpload
 * Componente para subir/actualizar la foto de perfil del usuario.
 * Muestra un avatar clickeable con preview, validación y estado de carga.
 */

'use client';

import React, { useRef, useState } from 'react';
import {
  Box,
  Avatar,
  IconButton,
  CircularProgress,
  Typography,
  Alert,
} from '@mui/material';
import { Button } from '@/components/ui/Button';
import { userService } from '@/services/userService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

interface AvatarUploadProps {
  /** URL actual del avatar (null si no tiene) */
  currentUrl: string | null;
  /** Nombre completo del usuario (para iniciales de fallback) */
  userName: string;
  /** Callback al subir exitosamente — recibe la nueva URL relativa */
  onUploadSuccess: (url: string) => void;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

export default function AvatarUpload({
  currentUrl,
  userName,
  onUploadSuccess,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Iniciales para fallback cuando no hay avatar */
  const initials = userName.charAt(0).toUpperCase();

  /** URL completa del avatar actual, apuntando al API Gateway */
  const avatarFullUrl = currentUrl
    ? `${API_BASE_URL}${currentUrl}`
    : null;

  /** Resetea el estado de preview */
  const resetPreview = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setError(null);
  };

  /** Maneja la selección de archivo desde el input */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Solo se permiten archivos JPG o PNG');
      e.target.value = '';
      return;
    }

    // Validar tamaño
    if (file.size > MAX_SIZE) {
      setError('El archivo excede el tamaño máximo de 2 MB');
      e.target.value = '';
      return;
    }

    // Mostrar preview
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  /** Sube el archivo seleccionado */
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const url = await userService.uploadAvatar(selectedFile);
      onUploadSuccess(url);
      resetPreview();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Error al subir la imagen'
      );
    } finally {
      setUploading(false);
    }
  };

  /** Abre el selector de archivos */
  const handleClick = () => {
    if (uploading) return;
    inputRef.current?.click();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
      {/* Input de archivo oculto */}
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* Avatar clickeable */}
      <Box sx={{ position: 'relative' }}>
        <IconButton
          onClick={handleClick}
          disabled={uploading}
          sx={{ p: 0 }}
        >
          <Avatar
            src={previewUrl || avatarFullUrl || undefined}
            alt={userName}
            sx={{
              width: 120,
              height: 120,
              bgcolor: previewUrl || avatarFullUrl ? 'transparent' : 'primary.light',
              color: 'primary.main',
              fontSize: '3rem',
              border: '2px solid',
              borderColor: 'divider',
              transition: 'opacity 0.2s',
              '&:hover': { opacity: 0.8 },
            }}
          >
            {!previewUrl && !avatarFullUrl && initials}
          </Avatar>
        </IconButton>

        {/* Overlay de cámara en hover */}
        {!uploading && !previewUrl && (
          <Box
            onClick={handleClick}
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              bgcolor: 'rgba(0,0,0,0.4)',
              opacity: 0,
              transition: 'opacity 0.2s',
              cursor: 'pointer',
              '&:hover': { opacity: 1 },
            }}
          >
            <Box
              component="span"
              className="material-symbols-outlined"
              sx={{ color: 'common.white', fontSize: '2rem', lineHeight: 1 }}
            >
              camera_alt
            </Box>
          </Box>
        )}

        {/* Spinner durante upload */}
        {uploading && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              bgcolor: (t: any) =>
                t.palette.mode === 'dark'
                  ? 'rgba(0,0,0,0.65)'
                  : 'rgba(255,255,255,0.7)',
            }}
          >
            <CircularProgress size={36} sx={{ color: 'primary.main' }} />
          </Box>
        )}
      </Box>

      {/* Label de acción */}
      {!previewUrl && !uploading && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
          onClick={handleClick}
        >
          {avatarFullUrl ? 'Cambiar foto' : 'Agregar foto'}
        </Typography>
      )}

      {/* Botones de acción cuando hay preview */}
      {previewUrl && !uploading && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            sx={{ height: 32, fontSize: '0.75rem', px: 2 }}
          >
            Guardar foto
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            onClick={resetPreview}
            sx={{ height: 32, fontSize: '0.75rem', px: 2 }}
          >
            Cancelar
          </Button>
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ py: 0, px: 1.5 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
