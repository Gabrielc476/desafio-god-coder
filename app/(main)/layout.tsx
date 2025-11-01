import React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { GlobalStateProvider } from '@/contexts/global-state-provider';

// Este layout envolve todas as nossas páginas de dashboard
// e fornece o Sidebar, Header e o Contexto.
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GlobalStateProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Sidebar />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <Header />
          <main className="flex-1 gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
          </main>
        </div>
      </div>
    </GlobalStateProvider>
  );
}

