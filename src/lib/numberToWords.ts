/**
 * Convierte un número a su representación en letras en español colombiano
 * Ej: 1500000 → "Un millón quinientos mil pesos colombianos M/CTE"
 */

const UNIDADES = [
  'cero',
  'un',
  'dos',
  'tres',
  'cuatro',
  'cinco',
  'seis',
  'siete',
  'ocho',
  'nueve',
];

const DECENAS = [
  '',
  'diez',
  'veinte',
  'treinta',
  'cuarenta',
  'cincuenta',
  'sesenta',
  'setenta',
  'ochenta',
  'noventa',
];

const ESPECIALES: Record<number, string> = {
  10: 'diez',
  11: 'once',
  12: 'doce',
  13: 'trece',
  14: 'catorce',
  15: 'quince',
  16: 'dieciséis',
  17: 'diecisiete',
  18: 'dieciocho',
  19: 'diecinueve',
};

function convertirGrupo(num: number): string {
  if (num === 0) {
    return '';
  }

  let result = '';

  // Centenas
  const centena = Math.floor(num / 100);
  if (centena > 0) {
    if (centena === 1) {
      result += 'ciento';
    } else if (centena === 2) {
      result += 'doscientos';
    } else if (centena === 3) {
      result += 'trescientos';
    } else if (centena === 4) {
      result += 'cuatrocientos';
    } else if (centena === 5) {
      result += 'quinientos';
    } else if (centena === 6) {
      result += 'seiscientos';
    } else if (centena === 7) {
      result += 'setecientos';
    } else if (centena === 8) {
      result += 'ochocientos';
    } else if (centena === 9) {
      result += 'novecientos';
    }
  }

  // Decenas y unidades
  const residuo = num % 100;

  if (residuo >= 10 && residuo <= 19) {
    // Números especiales: 10-19
    if (result) result += ' ';
    result += ESPECIALES[residuo];
  } else {
    // Decenas normales (20, 30, 40, ...)
    const decena = Math.floor(residuo / 10);
    const unidad = residuo % 10;

    if (decena > 0) {
      if (result) result += ' ';
      result += DECENAS[decena];
    }

    if (unidad > 0) {
      if (result && decena > 0) result += ' y ';
      else if (result) result += ' ';
      result += UNIDADES[unidad];
    }
  }

  return result;
}

export function numberToWords(amount: number): string {
  if (amount === 0) {
    return 'Cero pesos colombianos M/CTE';
  }

  if (amount < 0) {
    return 'Cantidad negativa';
  }

  const millones = Math.floor(amount / 1000000);
  const miles = Math.floor((amount % 1000000) / 1000);
  const unidades = amount % 1000;

  let resultado = '';

  if (millones > 0) {
    const millonesPalabra = convertirGrupo(millones);
    if (millones === 1) {
      resultado += 'Un millón';
    } else {
      resultado += millonesPalabra + ' millones';
    }
  }

  if (miles > 0) {
    const milesPalabra = convertirGrupo(miles);
    if (resultado) resultado += ' ';
    if (miles === 1) {
      resultado += 'mil';
    } else {
      resultado += milesPalabra + ' mil';
    }
  }

  if (unidades > 0) {
    const unidadesPalabra = convertirGrupo(unidades);
    if (resultado) resultado += ' ';
    resultado += unidadesPalabra;
  }

  // Capitalizar primera letra
  resultado = resultado.charAt(0).toUpperCase() + resultado.slice(1);

  return resultado + ' pesos colombianos M/CTE';
}

/**
 * Formatea un monto en COP con separador de miles
 * Ej: 1500000 → "$1.500.000"
 */
export function formatCOP(amount: number): string {
  return '$' + amount.toLocaleString('es-CO');
}
