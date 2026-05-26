'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/lib/types';
import {
  IconHome,
  IconUser,
  IconUsers,
  IconShield,
  IconDatabase,
  IconLogout,
  IconLogo,
  IconPlus,
  IconMenu,
  IconClose,
  IconChart,
} from '@/components/ui/Icons';

interface SidebarClientProps {
  role: UserRole;
  userEmail?: string;
  userName?: string;
}

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  match?: 'exact' | 'startsWith';
};

const cobradorItems: NavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: IconHome, match: 'exact' },
  { href: '/invoices/new', label: 'Nueva cuenta', icon: IconPlus },
  { href: '/companies', label: 'Mis empresas', icon: IconUsers },
  { href: '/reports', label: 'Reportes', icon: IconChart },
  { href: '/profile', label: 'Mi perfil', icon: IconUser },
];

const adminItems: NavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: IconHome, match: 'exact' },
  { href: '/admin/cobradores', label: 'Cobradores', icon: IconUsers },
  { href: '/admin/users', label: 'Usuarios', icon: IconUser },
  { href: '/admin/audit', label: 'Auditoría', icon: IconShield },
  { href: '/admin/db-setup', label: 'Base de datos', icon: IconDatabase },
];

function isActive(pathname: string, item: NavItem) {
  if (item.match === 'exact') return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function SidebarClient({ role, userEmail, userName }: SidebarClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = role === 'admin' ? adminItems : cobradorItems;

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <IconLogo size={18} />
          </div>
          <span className="text-sm font-semibold text-slate-900">CuentaFácil</span>
        </div>
        <button
          aria-label="Abrir menú"
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-2 text-slate-700 hover:bg-slate-100"
        >
          <IconMenu size={20} />
        </button>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform lg:relative lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <IconLogo size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight text-slate-900">CuentaFácil</p>
              <p className="text-[11px] leading-tight text-slate-500">
                {role === 'admin' ? 'Panel administrativo' : 'Panel cobrador'}
              </p>
            </div>
          </Link>
          <button
            aria-label="Cerrar menú"
            onClick={() => setMobileOpen(false)}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <IconClose size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Menú
          </p>
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                {active && (
                  <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-r-full bg-indigo-600" />
                )}
                <Icon size={18} className={active ? 'text-indigo-600' : 'text-slate-500'} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-slate-200 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                role === 'admin'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-emerald-100 text-emerald-700'
              )}
            >
              {(userName || userEmail || 'U').slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {userName || userEmail || 'Usuario'}
              </p>
              <p className="truncate text-xs text-slate-500">
                {role === 'admin' ? 'Administrador' : 'Cobrador'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <IconLogout size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
