/**
 * saleSubmit helpers
 * Normalización del payload de venta antes de enviarlo al backend y
 * recolección de campos pendientes desde los errores de react-hook-form.
 *
 * Causa raíz del bug "Crear Reserva no guarda":
 * 1. Los DateInput emiten '' al limpiar una fecha opcional. El backend
 *    espera DateTime? y un string vacío provoca 400 (no se puede
 *    convertir "" a DateTime?). Se normaliza '' -> undefined.
 * 2. Los numéricos opcionales pueden llegar como NaN (input vacío con
 *    valueAsNumber). Zod coerce + backend rechazan NaN. Se normaliza
 *    NaN -> undefined.
 */

import type { FieldErrors } from 'react-hook-form';
import type {
  CreateSaleFormData,
  SaleProviderItem,
  UpdateSaleFormData,
} from '@/types/sale';

export interface PendingField {
  /** Clave estable del campo (para keys de React). */
  key: string;
  /** Etiqueta legible del campo. */
  label: string;
  /** Mensaje de validación. */
  message: string;
}

const FIELD_LABELS: Record<string, string> = {
  clientId: 'Cliente titular',
  providers: 'Proveedores del paquete',
  description: 'Descripción',
  totalAmount: 'Monto total',
  isDollar: 'Moneda',
  profitPercentage: '% de ganancia',
  exchangeRate: 'Tipo de cambio',
  requiredDeposit: 'Pago inicial',
  finalPaymentDueDate: 'Fecha límite de liquidación',
  travelDate: 'Fecha de viaje',
  returnDate: 'Fecha de retorno',
  status: 'Estado',
  commissionableAmount: 'Monto comisionable',
  splitCommission: 'Desglose de comisión',
  providerId: 'Proveedor',
  reservationNumber: 'Clave / localizador',
};

function emptyToUndefined<T>(value: T | '' | undefined | null): T | undefined {
  if (value === '' || value === null) return undefined;
  return value as T | undefined;
}

function nanToUndefined(value: number | undefined): number | undefined {
  if (value === undefined || value === null) return undefined;
  return Number.isNaN(value) ? undefined : value;
}

function cleanString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

/**
 * Normaliza los datos del formulario a un payload apto para el backend:
 * - '' -> undefined en opcionales (fechas, descripción, claves).
 * - NaN -> undefined en numéricos opcionales.
 * - Elimina `splitCommission` (solo UI) y deja `commissionableAmount`
 *   únicamente cuando hay desglose.
 */
export function normalizeSalePayload(
  data: CreateSaleFormData | UpdateSaleFormData,
): Record<string, unknown> {
  const { splitCommission, ...rest } = data as CreateSaleFormData & {
    splitCommission?: boolean;
  };

  const providers = ((rest.providers ?? []) as SaleProviderItem[])
    .filter((p) => p && p.providerId > 0)
    .map((p) => ({
      ...(p.id !== undefined ? { id: p.id } : {}),
      providerId: p.providerId,
      reservationNumber: cleanString(p.reservationNumber) ?? '',
    }));

  return {
    clientId: rest.clientId,
    providers,
    description: cleanString(rest.description),
    totalAmount: rest.totalAmount,
    isDollar: rest.isDollar,
    profitPercentage: nanToUndefined(rest.profitPercentage),
    commissionableAmount: splitCommission
      ? nanToUndefined(rest.commissionableAmount)
      : undefined,
    exchangeRate: nanToUndefined(rest.exchangeRate),
    requiredDeposit: nanToUndefined(rest.requiredDeposit),
    finalPaymentDueDate: emptyToUndefined(rest.finalPaymentDueDate),
    travelDate: rest.travelDate,
    returnDate: emptyToUndefined(rest.returnDate),
    status: emptyToUndefined(rest.status),
    ...('active' in rest ? { active: (rest as UpdateSaleFormData).active } : {}),
  };
}

/** Extrae el primer mensaje legible de un nodo de error de RHF. */
function firstMessage(node: unknown): string | null {
  if (!node || typeof node !== 'object') return null;
  const record = node as Record<string, unknown>;
  if (typeof record.message === 'string' && record.message.length > 0) {
    return record.message;
  }
  return null;
}

/**
 * Aplana los errores de react-hook-form a una lista de campos pendientes
 * con etiquetas en español. Cubre errores anidados del arreglo
 * `providers` (ej. providers[0].providerId), que antes no se mostraban
 * en ningún lado y hacían que el botón pareciera no hacer nada.
 */
export function collectPendingFields(
  errors: FieldErrors<CreateSaleFormData | UpdateSaleFormData>,
): PendingField[] {
  const pending: PendingField[] = [];

  for (const [field, node] of Object.entries(errors ?? {})) {
    if (!node) continue;
    const label = FIELD_LABELS[field] ?? field;

    if (field === 'providers' && typeof node === 'object' && !('message' in (node as object))) {
      // Errores por índice: { 0: { providerId: { message } } }
      const entries = Object.entries(node as Record<string, unknown>);
      const itemErrors = entries.filter(([k]) => k !== 'message' && k !== 'root' && k !== 'type');
      if (itemErrors.length > 0) {
        for (const [index, itemNode] of itemErrors) {
          if (!itemNode || typeof itemNode !== 'object') continue;
          for (const [sub, subNode] of Object.entries(itemNode as Record<string, unknown>)) {
            const msg = firstMessage(subNode);
            if (msg) {
              pending.push({
                key: `providers.${index}.${sub}`,
                label: `${FIELD_LABELS[sub] ?? sub} (proveedor ${Number(index) + 1})`,
                message: msg,
              });
            }
          }
        }
        continue;
      }
    }

    const direct = firstMessage(node);
    if (direct) {
      pending.push({ key: field, label, message: direct });
      continue;
    }

    // Fallback: error con forma { root: { message } }
    const rootMsg =
      node && typeof node === 'object'
        ? firstMessage((node as Record<string, unknown>).root)
        : null;
    pending.push({
      key: field,
      label,
      message: rootMsg ?? 'Campo pendiente de capturar',
    });
  }

  return pending;
}

/** Indica si entre los pendientes falta agregar al menos un proveedor. */
export function needsProvider(pending: PendingField[]): boolean {
  return pending.some((p) => p.key === 'providers' || p.key.startsWith('providers.'));
}
