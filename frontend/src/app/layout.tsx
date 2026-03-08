/**
 * Root Layout
 * Layout raíz de la aplicación con configuración global
 */

'use client';

import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { PrimeReactProvider } from 'primereact/api';
import { ReactNode } from 'react';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ec5b13',
      light: 'rgba(236, 91, 19, 0.1)',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f8f6f6',
    },
    background: {
      default: '#f8f6f6',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      disabled: '#94a3b8',
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
    divider: '#e2e8f0',
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
          boxShadow: '0 4px 14px rgba(236, 91, 19, 0.25)',
          '&:hover': {
            boxShadow: '0 4px 14px rgba(236, 91, 19, 0.35)',
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
          border: '1px solid #e2e8f0',
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
            backgroundColor: '#f8fafc',
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
          borderBottom: '1px solid #e2e8f0',
          color: '#0f172a',
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
      <body style={{ margin: 0, backgroundColor: '#f8f6f6', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <style>{`
          .ta-input:focus {
            outline: none;
            border-color: #ec5b13 !important;
            box-shadow: 0 0 0 3px rgba(236, 91, 19, 0.12) !important;
          }
          .ta-input:disabled {
            cursor: not-allowed;
            opacity: 0.7;
          }
          .ta-input::placeholder {
            color: #94a3b8;
          }

          /* ── PrimeReact Calendar – TravelAgency Theme ─────────────────── */
          /*
           * En unstyled:true PrimeReact NO agrega clases p-* al DOM.
           * Todos los estilos se aplican via pt.className (ta-cal-*).
           */

          /* ── Wrapper (error / disabled state) ── */
          .ta-cal-wrapper { display: flex; flex-direction: column; }

          /* ── Root & Input ── */
          .ta-cal-root { width: 100%; display: flex; align-items: center; }
          .ta-cal-input {
            flex: 1 1 auto;
            height: 44px;
            border-radius: 8px 0 0 8px;
            padding: 0 12px;
            font-size: 14px;
            font-family: "Public Sans", system-ui, sans-serif;
            color: #0f172a;
            border: 1px solid #cbd5e1;
            border-right: none;
            background-color: #ffffff;
            outline: none;
            box-sizing: border-box;
            transition: border-color 0.2s, box-shadow 0.2s;
            cursor: text;
          }
          .ta-cal-input:focus {
            border-color: #ec5b13;
            box-shadow: 0 0 0 3px rgba(236, 91, 19, 0.12);
          }
          .ta-cal-input::placeholder { color: #94a3b8; }

          /* Error & disabled states driven by wrapper class */
          .ta-cal-err .ta-cal-input { border-color: #ef4444; }
          .ta-cal-err .ta-cal-btn  { background: #ef4444 !important; border-color: #ef4444 !important; }
          .ta-cal-dis .ta-cal-input { background-color: #f1f5f9; cursor: not-allowed; }
          .ta-cal-dis .ta-cal-btn  { opacity: 0.6; cursor: not-allowed; }

          /* ── Trigger button ── */
          .ta-cal-btn {
            background: #ec5b13;
            border: 1px solid #ec5b13;
            border-left: none;
            border-radius: 0 8px 8px 0;
            min-width: 44px;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #ffffff;
            flex-shrink: 0;
            padding: 0;
            transition: background 0.2s;
          }
          .ta-cal-btn:hover { background: #d44f0d; border-color: #d44f0d; }

          /* ── Panel (appended to body) ── */
          .ta-datepicker-panel {
            position: absolute;
            z-index: 9999 !important;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.14);
            padding: 12px 14px 14px;
            font-family: "Public Sans", system-ui, sans-serif;
            min-width: 280px;
            overflow: hidden;
          }

          /* ── Header ── */
          .ta-cal-hdr {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 10px;
            margin-bottom: 8px;
            border-bottom: 1px solid #f1f5f9;
          }
          .ta-cal-nav {
            background: none;
            border: none;
            cursor: pointer;
            color: #64748b;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            padding: 0;
            font-size: 14px;
            transition: background 0.15s, color 0.15s;
          }
          .ta-cal-nav:hover { background: #f1f5f9; color: #0f172a; }
          .ta-cal-title { display: flex; align-items: center; gap: 4px; }
          .ta-cal-period-btn {
            font-weight: 700;
            font-size: 14px;
            color: #0f172a;
            background: none;
            border: none;
            cursor: pointer;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: "Public Sans", system-ui, sans-serif;
            transition: background 0.15s;
          }
          .ta-cal-period-btn:hover { background: #f1f5f9; }

          /* ── Day grid ── */
          .ta-cal-table {
            border-collapse: separate;
            border-spacing: 2px;
            width: 100%;
            margin-top: 4px;
          }
          .ta-cal-wday {
            font-size: 11px;
            font-weight: 600;
            color: #94a3b8;
            text-align: center;
            padding: 2px 0 6px;
            width: 36px;
          }
          .ta-cal-day { text-align: center; padding: 1px; }
          .ta-cal-dl {
            width: 34px;
            height: 34px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            font-size: 13px;
            font-family: "Public Sans", system-ui, sans-serif;
            font-weight: 400;
            color: #1e293b;
            margin: 0 auto;
            background: transparent;
            cursor: pointer;
            transition: background 0.15s;
          }
          .ta-cal-dl:hover         { background: #fedfcd; color: #9a3d0b; }
          .ta-cal-dl.tod           { background: #f1f5f9; font-weight: 700; color: #475569; }
          .ta-cal-dl.sel           { background: #ec5b13 !important; color: #ffffff !important; font-weight: 700; }
          .ta-cal-dl.tod.sel       { background: #ec5b13 !important; color: #ffffff !important; }
          .ta-cal-dl.other         { color: #cbd5e1; }
          .ta-cal-dl.dis           { color: #e2e8f0; cursor: not-allowed; pointer-events: none; }

          /* ── Month picker ── */
          .ta-cal-mpicker,
          .ta-cal-ypicker {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 4px;
            padding: 4px 0;
          }
          .ta-cal-mitem,
          .ta-cal-yitem {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 36px;
            border-radius: 8px;
            font-size: 13px;
            font-family: "Public Sans", system-ui, sans-serif;
            font-weight: 500;
            color: #1e293b;
            cursor: pointer;
            background: transparent;
            border: none;
            transition: background 0.15s;
          }
          .ta-cal-mitem:hover,
          .ta-cal-yitem:hover { background: #fedfcd; color: #9a3d0b; }
          .ta-cal-mitem.sel,
          .ta-cal-yitem.sel { background: #ec5b13 !important; color: #ffffff !important; font-weight: 700; }
        `}</style>
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
