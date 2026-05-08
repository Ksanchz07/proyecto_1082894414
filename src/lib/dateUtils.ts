/**
 * Utilidades de formato de datos (NIT, fechas, etc.)
 */

/**
 * Formatea un NIT para presentación:
 * - 9 dígitos: XXX.XXX.XXX
 * - 10 dígitos: XXX.XXX.XXX-X (último es dígito de verificación)
 */
export function formatNIT(nit: string): string {
  const cleaned = (nit || '').toString().replace(/\D/g, '');

  if (cleaned.length === 9) {
    return `${cleaned.substring(0, 3)}.${cleaned.substring(3, 6)}.${cleaned.substring(6, 9)}`;
  }

  if (cleaned.length === 10) {
    return `${cleaned.substring(0, 3)}.${cleaned.substring(3, 6)}.${cleaned.substring(6, 9)}-${cleaned.substring(9, 10)}`;
  }

  return cleaned;
}
