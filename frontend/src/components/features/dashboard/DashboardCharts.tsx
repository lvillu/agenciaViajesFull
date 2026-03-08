/**
 * DashboardCharts Component
 * Gráficas del dashboard usando PrimeReact Charts (Chart.js)
 * - Ventas últimos 12 meses (barras horizontales)
 * - Ventas por proveedor últimos 12 meses (dona)
 * - Ganancias últimos 12 meses (barras horizontales)
 */

'use client';

import React from 'react';
import { Box, Card, CardContent, Typography, Skeleton, Alert } from '@mui/material';
import { Chart } from 'primereact/chart';
import BarChartIcon from '@mui/icons-material/BarChart';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { ChartDataResponse } from '@/types/dashboard';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrencyShort = (value: number) => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
  return `$${value.toFixed(0)}`;
};

// ─── Skeleton gráfica ─────────────────────────────────────────────────────────
const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 320 }) => (
  <Skeleton variant="rectangular" width="100%" height={height} sx={{ borderRadius: '10px' }} />
);

// ─── Card wrapper para gráfica ────────────────────────────────────────────────
interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconColor: string;
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, icon, iconColor, children }) => (
  <Card
    sx={{
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      boxShadow: 'none',
      flex: 1,
      minWidth: 0,
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 3 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            bgcolor: `${iconColor}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      {children}
    </CardContent>
  </Card>
);

// ─── Opciones base para barras horizontales ────────────────────────────────────
const buildBarOptions = (_accentColor: string) => ({
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: { parsed: { x: number } }) => ` ${formatCurrencyShort(ctx.parsed.x)} MXN`,
      },
      backgroundColor: '#221610',
      titleColor: '#f8f6f6',
      bodyColor: '#f8f6f6',
      padding: 10,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: { color: '#f1f5f9', drawBorder: false },
      ticks: {
        color: '#94a3b8',
        font: { family: '"Public Sans", system-ui, sans-serif', size: 11 },
        callback: (value: number) => formatCurrencyShort(value),
      },
      border: { display: false },
    },
    y: {
      grid: { display: false },
      ticks: {
        color: '#475569',
        font: { family: '"Public Sans", system-ui, sans-serif', size: 11, weight: '500' },
      },
      border: { display: false },
    },
  },
});

// ─── Opciones para dona ────────────────────────────────────────────────────────
const donutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: '#475569',
        font: { family: '"Public Sans", system-ui, sans-serif', size: 11 },
        padding: 16,
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx: { label: string; parsed: number }) =>
          ` ${ctx.label}: ${formatCurrencyShort(ctx.parsed)} MXN`,
      },
      backgroundColor: '#221610',
      titleColor: '#f8f6f6',
      bodyColor: '#f8f6f6',
      padding: 10,
      cornerRadius: 8,
    },
  },
};

// ─── Props del componente principal ──────────────────────────────────────────
interface DashboardChartsProps {
  monthlySales: ChartDataResponse | null;
  salesByProvider: ChartDataResponse | null;
  monthlyProfits: ChartDataResponse | null;
  loading: boolean;
  error: string | null;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  monthlySales,
  salesByProvider,
  monthlyProfits,
  loading,
  error,
}) => {
  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: '10px' }}>
        {error}
      </Alert>
    );
  }

  // Dataset con colores coherentes con el sistema de diseño
  const monthlySalesData = monthlySales
    ? {
        labels: monthlySales.labels,
        datasets: monthlySales.datasets.map((ds) => ({
          ...ds,
          backgroundColor: ds.backgroundColor ?? 'rgba(99,102,241,0.75)',
          borderRadius: 6,
          borderSkipped: false,
        })),
      }
    : null;

  const monthlyProfitsData = monthlyProfits
    ? {
        labels: monthlyProfits.labels,
        datasets: monthlyProfits.datasets.map((ds) => ({
          ...ds,
          backgroundColor: ds.backgroundColor ?? 'rgba(34,197,94,0.75)',
          borderRadius: 6,
          borderSkipped: false,
        })),
      }
    : null;

  const salesByProviderData = salesByProvider
    ? {
        labels: salesByProvider.labels,
        datasets: salesByProvider.datasets.map((ds) => ({
          ...ds,
          hoverOffset: 8,
        })),
      }
    : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Fila 1 — Ventas mensuales + Dona */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Ventas últimos 12 meses */}
        <ChartCard
          title="Ventas — últimos 12 meses"
          subtitle="Monto total en MXN por mes"
          icon={<BarChartIcon />}
          iconColor="#6366f1"
        >
          {loading || !monthlySalesData ? (
            <ChartSkeleton height={320} />
          ) : (
            <Box sx={{ height: 320 }}>
              <Chart
                type="bar"
                data={monthlySalesData}
                options={buildBarOptions('#6366f1')}
                style={{ height: '100%', width: '100%' }}
              />
            </Box>
          )}
        </ChartCard>

        {/* Ventas por proveedor — dona */}
        <Box sx={{ flex: '0 0 340px', minWidth: 0 }}>
          <ChartCard
            title="Ventas por proveedor"
            subtitle="Últimos 12 meses"
            icon={<DonutLargeIcon />}
            iconColor="#ec5b13"
          >
            {loading || !salesByProviderData ? (
              <ChartSkeleton height={320} />
            ) : salesByProviderData.labels.length === 0 ? (
              <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Sin datos disponibles
                </Typography>
              </Box>
            ) : (
              <Box sx={{ height: 320 }}>
                <Chart
                  type="doughnut"
                  data={salesByProviderData}
                  options={donutOptions}
                  style={{ height: '100%', width: '100%' }}
                />
              </Box>
            )}
          </ChartCard>
        </Box>
      </Box>

      {/* Fila 2 — Ganancias mensuales */}
      <ChartCard
        title="Ganancias — últimos 12 meses"
        subtitle="Ganancia estimada por mes (% comisión) en MXN"
        icon={<ShowChartIcon />}
        iconColor="#16a34a"
      >
        {loading || !monthlyProfitsData ? (
          <ChartSkeleton height={300} />
        ) : (
          <Box sx={{ height: 300 }}>
            <Chart
              type="bar"
              data={monthlyProfitsData}
              options={buildBarOptions('#16a34a')}
              style={{ height: '100%', width: '100%' }}
            />
          </Box>
        )}
      </ChartCard>
    </Box>
  );
};
