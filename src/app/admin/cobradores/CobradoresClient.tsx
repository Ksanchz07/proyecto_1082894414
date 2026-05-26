'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import {
  IconUsers,
  IconPlus,
  IconEdit,
  IconSearch,
} from '@/components/ui/Icons';
import type { User } from '@/lib/types';

type FilterStatus = 'all' | 'active' | 'suspended';

export function CobradoresClient({ initial }: { initial: User[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<FilterStatus>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initial.filter((c) => {
      if (status === 'active' && !c.is_active) return false;
      if (status === 'suspended' && c.is_active) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.identification_number || '').toLowerCase().includes(q) ||
        (c.bank_name || '').toLowerCase().includes(q)
      );
    });
  }, [initial, query, status]);

  const counters = useMemo(() => {
    const active = initial.filter((c) => c.is_active).length;
    return { all: initial.length, active, suspended: initial.length - active };
  }, [initial]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-indigo-600">Administración</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Cobradores</h1>
          <p className="mt-1 text-sm text-slate-600">
            Gestiona los perfiles de los trabajadores independientes que pueden generar cuentas de
            cobro.
          </p>
        </div>
        <Link href="/admin/cobradores/new">
          <Button>
            <span className="flex items-center gap-2">
              <IconPlus size={16} />
              Nuevo cobrador
            </span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-3">
            <FilterField label="Buscar">
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <IconSearch size={16} />
                </span>
                <input
                  placeholder="Nombre, correo, CC, banco..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-72 rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </FilterField>
            <FilterField label="Estado">
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                <SegBtn active={status === 'all'} onClick={() => setStatus('all')}>
                  Todos <Count value={counters.all} />
                </SegBtn>
                <SegBtn active={status === 'active'} onClick={() => setStatus('active')}>
                  Activos <Count value={counters.active} />
                </SegBtn>
                <SegBtn active={status === 'suspended'} onClick={() => setStatus('suspended')}>
                  Suspendidos <Count value={counters.suspended} />
                </SegBtn>
              </div>
            </FilterField>
            <div className="ml-auto text-xs text-slate-500">
              Mostrando <span className="font-mono tabular-nums">{filtered.length}</span> de{' '}
              <span className="font-mono tabular-nums">{initial.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cobradores registrados</CardTitle>
        </CardHeader>
        <CardContent>
          {initial.length === 0 ? (
            <EmptyState
              icon={<IconUsers size={28} className="text-slate-500" />}
              title="Aún no hay cobradores"
              description="Crea el primer cobrador con sus datos personales y bancarios. El sistema generará una contraseña temporal."
              action={
                <Link href="/admin/cobradores/new">
                  <Button>
                    <span className="flex items-center gap-2">
                      <IconPlus size={16} />
                      Crear primer cobrador
                    </span>
                  </Button>
                </Link>
              }
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<IconSearch size={28} className="text-slate-500" />}
              title="Sin coincidencias"
              description="Prueba con otros términos o cambia el filtro de estado."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery('');
                    setStatus('all');
                  }}
                >
                  Limpiar filtros
                </Button>
              }
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50/60 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Correo</th>
                    <th className="px-4 py-3">CC</th>
                    <th className="px-4 py-3">Banco</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((c) => {
                    const initials = (c.name || c.email || '?')
                      .split(' ')
                      .slice(0, 2)
                      .map((p) => p[0]?.toUpperCase())
                      .join('');
                    return (
                      <tr key={c.id} className="group transition hover:bg-indigo-50/40">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-slate-900">{c.name}</p>
                              <p className="text-[11px] text-slate-500">
                                {c.must_change_password ? 'Pendiente cambio de contraseña' : 'Cobrador'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">{c.email}</td>
                        <td className="px-4 py-3.5 font-mono text-slate-700 tabular-nums">
                          {c.identification_number || '—'}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">{c.bank_name || '—'}</td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              c.is_active
                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200'
                                : 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                c.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            {c.is_active ? 'Activo' : 'Suspendido'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Link
                            href={`/admin/cobradores/${c.id}/edit`}
                            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-100"
                          >
                            <IconEdit size={14} />
                            Editar
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function SegBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
        active
          ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
          : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  );
}

function Count({ value }: { value: number }) {
  return (
    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-slate-600">
      {value}
    </span>
  );
}
