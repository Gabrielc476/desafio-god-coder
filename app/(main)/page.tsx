import { Suspense } from 'react';
import { api } from '@/lib/api';
import { KpiCard } from '@/components/analytics/kpi-card';
import { RevenueChart } from '@/components/analytics/revenue-chart';
import { TopProductsTable } from '@/components/analytics/top-products-table';
import { Skeleton } from '@/components/ui/skeleton';

// Define a interface para os searchParams
interface DashboardPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

// --- Componentes de Loader ---

function DashboardLoader() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <div className="col-span-1 lg:col-span-4">
          <Skeleton className="h-[400px]" />
        </div>
        <div className="col-span-1 lg:col-span-3">
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    </>
  );
}

// --- Funções Auxiliares ---

// Helper para formatar moeda
const formatCurrency = (value: number | null | undefined) => {
  // Adiciona fallback para 0
  const numericValue = value || 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue);
};

// --- Componente de Dados Assíncrono ---
// Este componente é "envolvido" pelo Suspense

async function DashboardData({
  dateRange,
}: {
  dateRange: { from: string; to: string };
}) {
  // 1. Fetch de Dados com tratamento de erro (fallback para 0)
  const [averageTicket, topProducts, revenueOverTime] = await Promise.all([
    // Se falhar (404/rede), retorna um objeto seguro para evitar crash
    api.getAverageTicket(dateRange).catch(() => ({
      average_ticket: 0,
      totalSales: 0, // CORREÇÃO: totalSales é o nome certo
      total_revenue: 0,
    })),
    api.getTopProducts(dateRange, 10).catch(() => []),
    api.getRevenueOverTime(dateRange, 'day').catch(() => []),
  ]);

  // 2. Cálculo de KPIs agregados
  // CORREÇÃO: Certifique-se de que revenueOverTime não é undefined
  const totalRevenue = (revenueOverTime || []).reduce(
    (sum, item) => sum + (item.totalRevenue || 0),
    0
  );

  // 3. Conversão de Tipos e Formatação (Previne TypeError)
  // CORREÇÃO CRÍTICA: totalOrders agora acessa a prop correta: totalSales
  const totalOrders = averageTicket.totalSales || 0; 
  const totalRevenueStr = formatCurrency(totalRevenue);
  const avgTicketStr = formatCurrency(averageTicket.average_ticket);
  // Garante que totalOrders é um número antes de formatar
  const totalOrdersStr = (totalOrders || 0).toLocaleString('pt-BR'); 

  // 4. Renderizar os componentes
  return (
    <>
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Receita Total"
          value={totalRevenueStr}
          description="Soma de todos os pedidos no período"
        />
        <KpiCard
          title="Ticket Médio"
          value={avgTicketStr}
          description="Receita total / Pedidos totais"
        />
        <KpiCard
          title="Pedidos Totais"
          value={totalOrdersStr}
          description="Número total de pedidos concluídos"
        />
        {/* KPI de placeholder para manter o layout */}
        <Skeleton className="h-[120px]" />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <div className="col-span-1 lg:col-span-4">
          <RevenueChart data={revenueOverTime} />
        </div>
        <div className="col-span-1 lg:col-span-3">
          {/* Mostra Top 10 Produtos na tabela */}
          <TopProductsTable products={topProducts} />
        </div>
      </div>
    </>
  );
}

// --- A Página (Server Component) ---

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  // Esta linha resolve o erro do Next.js 16.
  // Ela passa o objeto de searchParams (que pode ser Promise)
  // para a função parseDateRange (em lib/api.ts) que é segura.
  const dateRange = api.parseDateRange(searchParams);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Header (DateRangePicker está no Header) */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* Grid de Componentes com Suspense */}
      <Suspense
        // A 'key' força o re-render da busca de dados quando a data muda
        key={dateRange.from + dateRange.to}
        fallback={<DashboardLoader />}
      >
        <DashboardData dateRange={dateRange} />
      </Suspense>
    </div>
  );
}
