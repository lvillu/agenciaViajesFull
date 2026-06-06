/**
 * Root Layout
 * Layout raíz de la aplicación con configuración global
 */

'use client';

import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { PrimeReactProvider } from 'primereact/api';
import { ReactNode } from 'react';
import '@/styles/ta-globals.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#5BA9B3',
      light: 'rgba(91, 169, 179, 0.1)',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#BDBFDC',
    },
    background: {
      default: 'rgba(189, 191, 220, 0.18)',
      paper: '#ffffff',
    },
    text: {
      primary: '#525252',
      secondary: '#8B8DA8',
      disabled: '#ADB0C8',
    },
    success: {
      main: '#16a34a',
    },
    warning: {
      main: '#ca8a04',
    },
    error: {
      main: '#dc2626',
    },
    divider: '#D8DAEA',
  },
  typography: {
    fontFamily: '"Public Sans", system-ui, sans-serif',
    h1: {
      fontSize: '30px',
      fontWeight: 800,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '24px',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '20px',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '18px',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    subtitle1: {
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: 1.5,
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
          height: 44,
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '14px',
        },
        contained: {
          boxShadow: '0 4px 14px rgba(91, 169, 179, 0.25)',
          '&:hover': {
            boxShadow: '0 4px 14px rgba(91, 169, 179, 0.35)',
          },
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
          border: '1px solid #D8DAEA',
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
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(189, 191, 220, 0.08)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          fontWeight: 600,
          fontSize: '12px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #D8DAEA',
          color: '#525252',
          boxShadow: 'none',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, backgroundColor: 'rgba(189,191,220,0.18)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <PrimeReactProvider value={{ unstyled: true }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </PrimeReactProvider>
      </body>
    </html>
  );
}
