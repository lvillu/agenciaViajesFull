/**
 * formatCurrency
 * Formatea un número como moneda con separadores de miles
 * y el código de moneda (MXN / USD).
 *
 * @param amount        - El valor numérico a formatear
 * @param isDollarOrCurrency - true → USD, false → MXN, o un string 'MXN'|'USD'
 * @returns String formateado, ej: "$1,500.00 USD"  /  "$1,500.00 MXN"
 */
export function formatCurrency(
  amount: number,
  isDollarOrCurrency?: boolean | string
): string {
  let currency = 'MXN';

  if (typeof isDollarOrCurrency === 'boolean') {
    currency = isDollarOrCurrency ? 'USD' : 'MXN';
  } else if (typeof isDollarOrCurrency === 'string') {
    currency = isDollarOrCurrency.toUpperCase();
  }

  const formatted = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `$${formatted} ${currency}`;
}
