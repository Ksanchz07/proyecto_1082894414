'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import {
  IconShield,
  IconSearch,
  IconArrowRight,
  IconKey,
  IconInvoice,
  IconUsers,
  IconCheck,
  IconAlert,
} from '@/components/ui/Icons';

interface AuditEntry {
  id: string;
  timestamp: string;
  user_id: string;
  user_email: string;
  user_role: string;
  action: string;
  entity: string;
  entity_id?: string;
  summary: string;
}

const actionOptions: Array<{ value: string; label: string }> = [
  { value: '', label: 'Todas las acciones' },
  { value: 'login', label: 'Inicio de sesión' },
  { value: 'logout', label: 'Cierre de sesión' },
  { value: 'generate_invoice', label: 'Generar cuenta de cobro' },
  { value: 'create_cobrador', label: 'Crear cobrador' },
  { value: 'update_cobrador', label: 'Actualizar cobrador' },
  { value: 'delete_cobrador', label: 'Eliminar cobrador' },
  { value: 'toggle_user', label: 'Activar/Suspender usuario' },
];

const actionMeta: Record<string, { label: string; tone: string; icon: React.ReactNode }> = {
  login: {
    label: 'Login',
    tone: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    icon: <IconKey size={12} />,
  },
  logout: {
    label: 'Logout',
    tone: 'bg-slate-100 text-slate-700 ring-slate-200',
    icon: <IconKey size={12} />,
  },
  generate_invoice: {
    label: 'Cuenta de cobro',
    tone: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    icon: <IconInvoice size={12} />,
  },
  create_cobrador: {
    label: 'Crear cobrador',
    tone: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    icon: <IconUsers size={12} />,
  },
  update_cobrador: {
    label: 'Editar cobrador',
    tone: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    icon: <IconUsers size={12} />,
  },
  delete_cobrador: {
    label: 'Eliminar cobrador',
    tone: 'bg-red-50 text-red-700 ring-red-200',
    icon: <IconUsers size={12} />,
  },
  toggle_user: {
    label: 'Estado usuario',
    tone: 'bg-amber-50 text-amber-700 ring-amber-200',
    icon: <IconCheck size={12} />,
  },
  bootstrap: {
    label: 'Sistema',
    tone: 'bg-slate-100 text-slate-700 ring-slate-200',
    icon: <IconAlert size={12} />,
  },
};

function ActionBadge({ action }: { action: string }) {
  const meta = actionMeta[action] || {
    label: action,
    tone: 'bg-slate-100 text-slate-700 ring-slate-200',
    icon: null,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${meta.tone}`}
    >
      {meta.icon}
      {meta.label}
    </span>
  );
}

export function AuditClient() {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [action, setAction] = useState<string>('');
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (month) params.set('month', month);
    if (action) params.set('action', action);

    fetch(`/api/admin/audit?${params.toString()}`)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || 'Error al cargar');
        return j.audits || [];
      })
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [month, action]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.user_email?.toLowerCase().includes(q) ||
        e.summary?.toLowerCase().includes(q) ||
        e.entity_id?.toLowerCase().includes(q)
    );
  }, [entries, query]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">Auditoría</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Bitácora del sistema</h1>
        <p className="mt-1 text-sm text-slate-600">
          Cada operación crítica queda registrada con timestamp del servidor y autor.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-3">
            <FilterField label="Mes">
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </FilterField>
            <FilterField label="Acción">
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="min-w-[200px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              >
                {actionOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </FilterField>
            <FilterField label="Buscar">
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <IconSearch size={16} />
                </span>
                <input
                  placeholder="Correo, resumen, ID..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-64 rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </FilterField>
            {(action || query) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setAction('');
                  setQuery('');
                }}
              >
                Limpiar filtros
              </Button>
            )}
            <div className="ml-auto text-xs text-slate-500">
              <span className="font-mono tabular-nums">{filtered.length}</span> de{' '}
              <span className="font-mono tabular-nums">{entries.length}</span> registros
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registros</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
              <IconAlert size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <ul className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <li
                  key={i}
                  className="h-14 animate-pulse rounded-lg bg-slate-100"
                  style={{ animationDelay: `${i * 80}ms` }}
                />
              ))}
            </ul>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<IconShield size={28} className="text-slate-500" />}
              title="Sin registros para los filtros actuales"
              description="Prueba con otro mes o limpia los filtros para ver toda la actividad."
            />
          ) : (
            <ol className="relative space-y-3 border-l border-slate-200 pl-6">
              {filtered.map((entry) => (
                <li key={entry.id} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-[27px] top-2 h-2 w-2 rounded-full bg-indigo-500 ring-4 ring-white"
                  />
                  <div className="rounded-lg border border-slate-200 bg-white p-3.5 transition hover:border-indigo-200 hover:shadow-sm">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ActionBadge action={entry.action} />
                        <span className="text-sm font-medium text-slate-900">
                          {entry.summary}
                        </span>
                      </div>
                      <time className="font-mono text-[11px] tabular-nums text-slate-500">
                        {new Date(entry.timestamp).toLocaleString('es-CO', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </time>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <IconArrowRight size={10} className="text-slate-400" />
                        {entry.user_email}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">
                        {entry.user_role}
                      </span>
                      {entry.entity_id && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="font-mono">
                            {entry.entity}:{' '}
                            <span className="text-slate-700">
                              {entry.entity_id.slice(0, 8)}
                            </span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
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
