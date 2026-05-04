import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { UserRole } from '@/lib/types';
import {
  Home,
  FileText,
  User,
  Users,
  Shield,
  Settings,
  Plus,
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
}

const cobradorItems = [
  {
    href: '/dashboard',
    label: 'Inicio',
    icon: Home,
  },
  {
    href: '/dashboard/new-invoice',
    label: 'Nueva Cuenta de Cobro',
    icon: Plus,
  },
  {
    href: '/dashboard/profile',
    label: 'Mi Perfil',
    icon: User,
  },
];

const adminItems = [
  {
    href: '/admin/cobradores',
    label: 'Cobradores',
    icon: Users,
  },
  {
    href: '/admin/users',
    label: 'Usuarios',
    icon: User,
  },
  {
    href: '/admin/auditoria',
    label: 'Auditoría',
    icon: Shield,
  },
  {
    href: '/admin/db-setup',
    label: 'Administración del Sistema',
    icon: Settings,
  },
];

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const items = role === 'admin' ? adminItems : cobradorItems;

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-indigo-600">CuentaFácil</h1>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-4">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
