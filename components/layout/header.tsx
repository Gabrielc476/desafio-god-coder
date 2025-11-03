'use client'

import { Menu, Package2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { DateRangeInputs } from './date-range-inputs'

export function Header() {
  const pathname = usePathname()

  const navLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/produtos', label: 'Produtos' },
    { href: '/clientes', label: 'Clientes' },
    { href: '/canais', label: 'Canais' },
    { href: '/pagamentos', label: 'Pagamentos' },
    { href: '/heatmap', label: 'Mapa de Calor' },
    { href: '/chat', label: 'Chat' },
    { href: '/relatorios', label: 'Relatórios' },
  ]

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="#"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Package2 className="h-6 w-6" />
          <span className="sr-only">Nola Analytics</span>
        </Link>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              // *** CORREÇÃO 1: Adicionado 'whitespace-nowrap' ***
              'whitespace-nowrap transition-colors hover:text-foreground',
              pathname === link.href
                ? 'text-foreground'
                : 'text-muted-foreground',
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu de navegação</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="#"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Package2 className="h-6 w-6" />
              <span className="sr-only">Nola Analytics</span>
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  // *** CORREÇÃO 1 (Mobile): Adicionado 'whitespace-nowrap' ***
                  'whitespace-nowrap transition-colors hover:text-foreground',
                  pathname === link.href
                    ? 'text-foreground'
                    : 'text-muted-foreground',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      
      {/* *** CORREÇÃO 2: Removido 'w-full' do div abaixo *** */}
      <div className="flex items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        {/* O <form> de busca foi removido */}
        
        <DateRangeInputs />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <span className="font-semibold">M</span>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Maria (Restaurante)</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Configurações</DropdownMenuItem>
            <DropdownMenuItem>Suporte</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}