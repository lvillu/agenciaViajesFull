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
  isDollarOrCurrency?: boolean | 'MXN' | 'USD'
): string {
  let currency = 'MXN';

  if (typeof isDollarOrCurrency === 'boolean') {
    currency = isDollarOrCurrency ? 'USD' : 'MXN';
  } else if (isDollarOrCurrency === 'MXN' || isDollarOrCurrency === 'USD') {
    currency = isDollarOrCurrency;
  }

  const formatted = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `$${formatted} ${currency}`;
}
