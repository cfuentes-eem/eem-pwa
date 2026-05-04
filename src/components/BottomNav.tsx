'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  CalendarDays,
  MessageCircle,
  BookOpen,
  User,
  LayoutDashboard,
  MessageSquare,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  emphasized?: boolean;
};

const TRAB_NAV: NavItem[] = [
  { href: '/trabajador', label: 'Inicio', icon: Home },
  { href: '/trabajador/calendario', label: 'Calendario', icon: CalendarDays },
  { href: '/trabajador/asistente', label: 'Asistente', icon: MessageCircle, emphasized: true },
  { href: '/trabajador/recursos', label: 'Recursos', icon: BookOpen },
  { href: '/trabajador/perfil', label: 'Yo', icon: User },
];

const RRHH_NAV: NavItem[] = [
  { href: '/responsable', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/responsable/planner', label: 'Planner', icon: CalendarDays },
  {
    href: '/responsable/equipo-eem',
    label: 'Equipo EEM',
    icon: MessageSquare,
    emphasized: true,
  },
  { href: '/responsable/metricas', label: 'Métricas', icon: BarChart3 },
  { href: '/responsable/perfil', label: 'Yo', icon: User },
];

export function BottomNav({ rol }: { rol: 'trabajador' | 'responsable' }) {
  const pathname = usePathname();
  const items = rol === 'trabajador' ? TRAB_NAV : RRHH_NAV;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-eem-line bg-white/95 px-3 py-3 backdrop-blur">
      {items.map(({ href, label, icon: Icon, emphasized }) => {
        const active = pathname === href;
        if (emphasized) {
          return (
            <Link key={href} href={href} className="flex flex-1 flex-col items-center gap-1">
              <div className="-mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-eem-red">
                <Icon size={16} className="text-white" />
              </div>
              <span
                className={`text-[10px] font-medium ${
                  active ? 'text-eem-red' : 'text-[#9aa0a0]'
                }`}
              >
                {label}
              </span>
            </Link>
          );
        }
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-1 ${
              active ? 'text-eem-red' : 'text-[#9aa0a0]'
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
