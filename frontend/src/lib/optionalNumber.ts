/**
 * optionalNumber
 * Utilidades para campos numéricos OPCIONALES del formulario.
 *
 * Un input numérico vacío produce `NaN` (con `valueAsNumber`) o `''` al
 * limpiarse. Zod lo rechaza con "expected number, received NaN" ANTES de que
 * `.optional()` pueda ignorarlo, así que un campo opcional sin capturar
 * bloquea el envío con un mensaje incomprensible. Estas utilidades normalizan
 * vacío / null / NaN a `undefined`.
 */

/** Indica si el valor corresponde a un campo numérico sin capturar. */
export function isBlankNumber(value: unknown): boolean {
  return (
    value === '' ||
    value === null ||
    value === undefined ||
    (typeof value === 'number' && Number.isNaN(value))
  );
}

/**
 * `setValueAs` de react-hook-form para inputs numéricos opcionales.
 * Devuelve `undefined` (y nunca `NaN`) cuando el input está vacío.
 */
export function toOptionalNumber(value: unknown): number | undefined {
  if (isBlankNumber(value)) return undefined;

  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/** Preprocesador de Zod: normaliza vacío / null / NaN a `undefined`. */
export function blankToUndefined(value: unknown): unknown {
  return isBlankNumber(value) ? undefined : value;
}
