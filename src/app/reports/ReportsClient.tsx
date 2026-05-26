'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  IconChart,
  IconInvoice,
  IconUsers,
  IconArrowRight,
} from '@/components/ui/Icons';

export function ReportsClient() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const years = Array.from({ length: 6 }, (_, i) => now.getFullYear() - i);
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-indigo-600">Reportes</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Generar reportes
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Reportes imprimibles (HTML → PDF desde tu navegador) para declaraciones tributarias y
          certificados a clientes.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <IconChart size={18} />
              </span>
              <CardTitle className="text-base">Reporte mensual</CardTitle>
            </div>
            <p className="text-sm text-slate-500">
              Todas las cuentas del mes con total facturado, cobrado y pendiente. Útil para tu
              declaración de IVA.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Mes
                </span>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                >
                  {months.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Año
                </span>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <Link href={`/reports/monthly?year=${year}&month=${month}`}>
              <Button className="w-full">
                <span className="flex items-center gap-2">
                  <IconArrowRight size={16} />
                  Generar reporte mensual
                </span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <IconInvoice size={18} />
              </span>
              <CardTitle className="text-base">Reporte anual</CardTitle>
            </div>
            <p className="text-sm text-slate-500">
              Resumen del año por mes, con totales. Útil para tu declaración de renta y para tener
              visión global de tu actividad.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Año
              </span>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
            <Link href={`/reports/yearly?year=${year}`}>
              <Button className="w-full" variant="outline">
                <span className="flex items-center gap-2">
                  <IconArrowRight size={16} />
                  Generar reporte anual
                </span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-fuchsia-50 text-fuchsia-600">
                <IconUsers size={18} />
              </span>
              <CardTitle className="text-base">Certificado por empresa</CardTitle>
            </div>
            <p className="text-sm text-slate-500">
              Certificado oficial de ingresos para una empresa pagadora específica — lista de
              cuentas emitidas con valores. Se genera desde la lista de empresas.
            </p>
          </CardHeader>
          <CardContent>
            <Link href="/companies">
              <Button variant="outline">
                <span className="flex items-center gap-2">
                  <IconUsers size={16} />
                  Ir a mis empresas
                </span>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
