/**
 * Currency formatting utility for Nigerian Naira (NGN, ₦)
 */
export function formatNaira(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₦0';
  }
  return '₦' + Math.round(amount).toLocaleString('en-NG');
}

export function formatPrice(amount: number): string {
  return formatNaira(amount);
}
