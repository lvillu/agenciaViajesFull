# Frontend Conventions — Next.js 15 + React 19 + TypeScript

## Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 / Material UI 6 + Emotion / PrimeReact (unstyled)
- **Lenguaje**: TypeScript 5
- **Estado global**: Zustand
- **HTTP**: Axios
- **Formularios**: React Hook Form + Zod
- **Fuente**: Public Sans

---

## Ubicaciones clave

| Qué | Ruta |
|-----|------|
| Páginas | `frontend/src/app/` |
| Componentes UI primitivos | `frontend/src/components/ui/` |
| Componentes compartidos | `frontend/src/components/shared/` |
| Componentes de feature | `frontend/src/components/features/{module}/` |
| Hooks | `frontend/src/hooks/` |
| Servicios HTTP | `frontend/src/services/` |
| Cliente HTTP | `frontend/src/services/apiClient.ts` |
| Stores Zustand | `frontend/src/store/` |
| Tipos TypeScript | `frontend/src/types/` |
| Constantes | `frontend/src/lib/constants.ts` |
| Diseño del proyecto | `.doc/design_system_estilos_base_md.md` |
| Estilos TravelAgency | `.doc/travel_agency_styles.md` |

---

## Regla crítica — Gateway

El frontend **siempre** se comunica a través del API Gateway en el puerto 5050.

```
Frontend → http://localhost:5050 (KrakenD) → Backend :8080
```

```typescript
// ✅ CORRECTO
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

// ❌ INCORRECTO — el backend no es accesible directamente
export const API_BASE_URL = 'http://localhost:8080';
```

---

## Naming conventions

| Artefacto | Patrón | Ejemplo |
|-----------|--------|---------|
| Componente | PascalCase | `ClientesList`, `SaleForm` |
| Hook | `use` + PascalCase | `useClients`, `useSales` |
| Servicio | camelCase + `Service` | `clientService`, `saleService` |
| Store | camelCase + `Store` | `authStore`, `clientStore` |
| Tipos | PascalCase | `Client`, `CreateClientRequest` |
| Esquema Zod | PascalCase + `Schema` | `CreateClientSchema` |
| Constantes | SCREAMING_SNAKE_CASE | `API_BASE_URL` |

---

## Estructura de ApiResponse<T>

Todas las respuestas del backend vienen envueltas:

```typescript
// types/api.d.ts
export interface ApiResponse<T> {
  data: T;
  status: 'Completed' | 'Failure';
  message: string;
  isSuccess: boolean;
}
```

---

## Templates

### Tipo de dominio

```typescript
// types/{module}.d.ts
export interface Client {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  active: boolean;
  createdAt: string;
}

export interface CreateClientRequest {
  fullName: string;
  email: string;
  phone: string;
}

export interface UpdateClientRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  active?: boolean;
}
```

---

### Servicio HTTP

```typescript
// services/clientService.ts
import { apiClient } from './apiClient';
import { ApiResponse } from '@/types/api';
import { Client, CreateClientRequest } from '@/types/client';

export const clientService = {
  async getAll(): Promise<Client[]> {
    const response = await apiClient.get<ApiResponse<Client[]>>('/clients');
    if (!response.data.isSuccess) throw new Error(response.data.message);
    return response.data.data;  // ← SIEMPRE extraer .data
  },

  async getById(id: number): Promise<Client> {
    const response = await apiClient.get<ApiResponse<Client>>(`/clients/${id}`);
    if (!response.data.isSuccess) throw new Error(response.data.message);
    return response.data.data;
  },

  async create(data: CreateClientRequest): Promise<Client> {
    const response = await apiClient.post<ApiResponse<Client>>('/clients', data);
    if (!response.data.isSuccess) throw new Error(response.data.message);
    return response.data.data;
  },

  async update(id: number, data: UpdateClientRequest): Promise<Client> {
    const response = await apiClient.put<ApiResponse<Client>>(`/clients/${id}`, data);
    if (!response.data.isSuccess) throw new Error(response.data.message);
    return response.data.data;
  },

  async remove(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/clients/${id}`);
    if (!response.data.isSuccess) throw new Error(response.data.message);
  },
};
```

> Los services retornan el tipo `T` directamente, nunca `ApiResponse<T>`.

---

### Custom Hook

```typescript
// hooks/useClients.ts
'use client';

import { useState, useEffect } from 'react';
import { clientService } from '@/services/clientService';
import { Client, CreateClientRequest } from '@/types/client';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (data: CreateClientRequest) => {
    const newClient = await clientService.create(data);
    setClients(prev => [...prev, newClient]);
    return newClient;
  };

  useEffect(() => { fetchClients(); }, []);

  return { clients, loading, error, fetchClients, createClient };
};
```

---

### Zustand Store

```typescript
// store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: { userName: string; fullName: string } | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthState['user']) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);
```

---

### Esquema Zod + React Hook Form

```typescript
// types/client.d.ts  (esquemas)
import { z } from 'zod';

export const CreateClientSchema = z.object({
  fullName: z.string().min(2, 'Mínimo 2 caracteres').min(1, 'Requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(8, 'Teléfono inválido'),
});

export type CreateClientForm = z.infer<typeof CreateClientSchema>;
```

```typescript
// En el componente de formulario
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<CreateClientForm>({
  resolver: zodResolver(CreateClientSchema),
});
```

---

### Página (Next.js 15 App Router)

```typescript
// app/(protected)/clients/page.tsx
'use client';

import React from 'react';
import { useClients } from '@/hooks/useClients';

export default function ClientsPage() {
  const { clients, loading, error } = useClients();

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Clientes</h1>
      {/* contenido */}
    </div>
  );
}
```

---

## Reglas críticas

- Componentes interactivos: incluir `'use client'` al inicio.
- Services: validar `isSuccess` y extraer `.data` antes de retornar — nunca retornar `ApiResponse<T>`.
- Formularios: siempre Zod + `zodResolver` + React Hook Form. Nunca validación manual.
- Estado local: `useState`. Estado global/persistido: Zustand. Datos del servidor: hook con service.
- Nunca usar `any`. Usar `unknown` + type guard cuando el tipo es incierto.
- Inputs de MUI: usar `InputLabelProps={{ shrink: true }}` para que el label quede fijo arriba.
- PrimeReact: siempre con `unstyled={true}`. Nunca importar CSS de tema de PrimeReact.
- Nunca modificar Header/Footer sin aprobación explícita.
