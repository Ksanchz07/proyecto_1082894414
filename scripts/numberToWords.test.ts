// Script de pruebas para numberToWords
// Requiere ts-node: instalar con `npm i -D ts-node typescript @types/node` y ejecutar:
// npx ts-node scripts/numberToWords.test.ts

import { numberToWords } from '../src/lib/numberToWords';

const cases: Array<[number, string]> = [
  [1000, 'Un mil pesos colombianos M/CTE'],
  [350000, 'Trescientos cincuenta mil pesos colombianos M/CTE'],
  [1500000, 'Un millón quinientos mil pesos colombianos M/CTE'],
  [12000000, 'Doce millones de pesos colombianos M/CTE'],
  [1234567, 'Un millón doscientos treinta y cuatro mil quinientos sesenta y siete pesos colombianos M/CTE'],
];

for (const [n, expected] of cases) {
  const out = numberToWords(n);
  const ok = out === expected;
  console.log(`${n} → ${out} ${ok ? 'OK' : `FAIL (expected: ${expected})`}`);
}
