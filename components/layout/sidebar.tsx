'use client';

import Link from 'next/link';
import {
  Home,
  Users,
  LineChart,
  Package,
  CreditCard,
  Building,
  FileText,
  Settings,
  Grid,
  MessageSquare,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

// Itens de navegação
const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/produtos', label: 'Produtos', icon: Package },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/canais', label: 'Canais', icon: Building },
  { href: '/pagamentos', label: 'Pagamentos', icon: CreditCard },
  { href: '/heatmap', label: 'Mapa de Calor', icon: Grid },
  { href: '/relatorios', label: 'Relatórios', icon: FileText },
  { href: '/chat', label: 'Chat', icon: MessageSquare }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="#"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <LineChart className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">Nola Analytics</span>
          </Link>

          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                    pathname === item.href &&
                      'bg-accent text-accent-foreground',
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
        
        {/* Navegação inferior (ex: Configurações) */}
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Configurações</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Configurações</TooltipContent>
          </Tooltip>
        </nav>
      </TooltipProvider>
    </aside>
  );
}