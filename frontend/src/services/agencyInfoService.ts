import { apiClient } from './apiClient';
import { ApiResponse } from '@/types/api';
import { AgencyInfo, UpdateAgencyInfoRequest } from '@/types/agencyInfo';

export const agencyInfoService = {
  async getAgencyInfo(): Promise<AgencyInfo> {
    const response = await apiClient.get<ApiResponse<AgencyInfo>>('/api/AgencyInfo');

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al obtener información de la agencia');
    }

    return response.data.data;
  },

  async updateAgencyInfo(data: UpdateAgencyInfoRequest): Promise<AgencyInfo> {
    const response = await apiClient.put<ApiResponse<AgencyInfo>>('/api/AgencyInfo', data);

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al actualizar información de la agencia');
    }

    return response.data.data;
  },
};
