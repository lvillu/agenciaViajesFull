/**
 * Root Layout
 * Layout raíz de la aplicación con configuración global
 */

'use client';

import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { ReactNode } from 'react';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2F80ED',
      light: 'rgba(47,128,237,0.1)',
    },
    secondary: {
      main: '#00B4D8',
    },
    background: {
      default: '#F7F9FC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      disabled: '#9CA3AF',
    },
    success: {
      main: '#27AE60',
    },
    warning: {
      main: '#F2C94C',
    },
    error: {
      main: '#EB5757',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    h1: {
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '18px',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '16px',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    subtitle1: {
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '13px',
      fontWeight: 400,
      lineHeight: 1.4,
    },
    body2: {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: 1.4,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          height: 40,
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
        },
      },
    },
  },
});

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Agencia Viajes</title>
        <meta name="description" content="Sistema de gestión de viajes" />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
