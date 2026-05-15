'use client';

import { useState, useCallback } from 'react';
import { agencyInfoService } from '@/services/agencyInfoService';
import { AgencyInfo, UpdateAgencyInfoRequest } from '@/types/agencyInfo';

export const useAgencyInfo = () => {
  const [agencyInfo, setAgencyInfo] = useState<AgencyInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgencyInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await agencyInfoService.getAgencyInfo();
      setAgencyInfo(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar información de la agencia');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAgencyInfo = useCallback(async (data: UpdateAgencyInfoRequest): Promise<AgencyInfo> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await agencyInfoService.updateAgencyInfo(data);
      setAgencyInfo(updated);
      return updated;
    } catch (err: any) {
      const message = err.message || 'Error al actualizar información de la agencia';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { agencyInfo, loading, error, fetchAgencyInfo, updateAgencyInfo };
};
