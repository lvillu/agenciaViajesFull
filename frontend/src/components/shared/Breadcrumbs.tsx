/**
 * Breadcrumbs Component
 * Breadcrumbs de navegación para las páginas
 */

'use client';

import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import HomeIcon from '@mui/icons-material/Home';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const router = useRouter();

  return (
    <MuiBreadcrumbs 
      aria-label="breadcrumb"
      sx={{ mb: 3 }}
    >
      <Link
        component="button"
        variant="body1"
        onClick={() => router.push('/')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          color: 'text.secondary',
          textDecoration: 'none',
          cursor: 'pointer',
          '&:hover': {
            color: 'primary.main',
            textDecoration: 'underline',
          },
        }}
      >
        <HomeIcon sx={{ fontSize: 16 }} />
        Home
      </Link>
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        if (isLast || !item.href) {
          return (
            <Typography 
              key={index} 
              variant="body1" 
              sx={{ color: 'text.primary' }}
            >
              {item.label}
            </Typography>
          );
        }
        
        return (
          <Link
            key={index}
            component="button"
            variant="body1"
            onClick={() => router.push(item.href!)}
            sx={{
              color: 'text.secondary',
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': {
                color: 'primary.main',
                textDecoration: 'underline',
              },
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
};
