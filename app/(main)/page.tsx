import { api, DateRange } from '@/lib/api';
import { KpiCard } from '@/components/analytics/kpi-card';
import { formatCurrency } from '@/lib/utils';
import { TopProductsTable } from '@/components/analytics/top-products-table';
import { RevenueChart } from '@/components/analytics/revenue-chart';

// Função para definir o range de datas padrão
function getDefaultDateRange(): DateRange {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30); // Padrão: últimos 30 dias
  return {
    from: startDate.toISOString().split('T')[0],
    to: endDate.toISOString().split('T')[0],
  };
}

// Esta é uma PÁGINA DE SERVIDOR (RSC)
// Ela busca os dados diretamente no servidor.
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  // 1. Ler o filtro de data da URL ou usar o padrão
  const dateRange: DateRange = {
    from: searchParams.from || getDefaultDateRange().from,
    to: searchParams.to || getDefaultDateRange().to,
  };

  // 2. Buscar dados da API (server-to-server) em paralelo
  const [
    avgTicketData,
    topProductsData,
    revenueOverTimeData
  ] = await Promise.all([
    api.getAverageTicket(dateRange),
    api.getTopProducts(dateRange, 5), // Pedimos só 5 para o dashboard
    api.getRevenueOverTime(dateRange, 'day')
  ]);

  // 3. Renderizar os componentes (alguns de servidor, outros de cliente)
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      
      {/* KPI Cards (Server Components) */}
      <KpiCard
        title="Receita Total"
        value={formatCurrency(avgTicketData.totalRevenue)}
        description={`${avgTicketData.totalSales} vendas no período`}
      />
      <KpiCard
        title="Ticket Médio"
        value={formatCurrency(avgTicketData.averageTicket)}
        description="Receita média por venda"
      />
      <KpiCard
        title="Total de Vendas"
        value={avgTicketData.totalSales.toString()}
        description="Pedidos totais no período"
      />
      <KpiCard
        title="Top Produto"
        value={topProductsData[0]?.name || 'N/A'}
        description={`Receita: ${formatCurrency(topProductsData[0]?.totalRevenue)}`}
      />

      {/* Gráficos e Tabelas (Client Components) */}
      <div className="col-span-4 lg:col-span-2">
        <RevenueChart data={revenueOverTimeData} />
      </div>
      <div className="col-span-4 lg:col-span-2">
        <TopProductsTable data={topProductsData} />
      </div>

    </div>
  );
}

