/**
 * Home Page — Server Component
 *
 * Este componente ejecuta en el servidor durante renderizado.
 * Lee los datos JSON desde /data/pages/home.json usando readJson<T>()
 * y pasa props tipadas al componente HolaMundo.
 *
 * Ventajas de este patrón:
 * 1. Sin llamada HTTP innecesaria (mejora performance)
 * 2. Datos disponibles en el primer render (SSR)
 * 3. TypeScript valida en compilación que HomeData cumple el contrato
 * 4. El cliente solo recibe HTML renderizado + CSS/JS mínimo
 */

import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/login');
}

