export interface AgencyInfo {
  id: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  secturReg?: string;
  facebook?: string;
  instagram?: string;
  logoUrl?: string;
  updatedAt?: string;
}

export interface UpdateAgencyInfoRequest {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  secturReg?: string;
  facebook?: string;
  instagram?: string;
  logoUrl?: string;
}
