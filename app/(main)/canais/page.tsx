import { Suspense } from 'react';
import { api } from '@/lib/api';
// CORREÇÃO: Removida a importação do tipo 'PageSearchParams'
import { SalesByChannelChart } from '@/components/analytics/sales-by-channel-chart';
import { SalesHeatmapTable } from '@/components/analytics/sales-heatmap-table';
import { Skeleton } from '@/components/ui/skeleton';

// Componente de Carregamento (Loading Skeleton) para o Gráfico
function ChannelChartSkeleton() {
  return <Skeleton className="h-[350px] w-full" />;
}

// Componente de Carregamento (Loading Skeleton) para a Tabela
function HeatmapTableSkeleton() {
  return <Skeleton className="h-[400px] w-full" />;
}

// CORREÇÃO: Tipagem explícita dos searchParams
type CanaisPageProps = {
  searchParams: { [key: string]: string | undefined };
};

/**
 * Página de Análise de Canais (Caso de Uso 3 e 5)
 * Esta é um Server Component (RSC) assíncrona.
 */
export default async function CanaisPage({ searchParams }: CanaisPageProps) {
  // Pega o 'from' e 'to' da URL, ou usa o default de 30 dias
  const { from, to } = api.parseDateRange(searchParams);

  // Inicia a busca de dados em paralelo
  const salesByChannelData = api.getSalesByChannel({ from, to });
  const salesHeatmapData = api.getSalesHeatmap({ from, to });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Análise de Canais</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Card 1: Gráfico de Vendas por Canal (CU 3) */}
        <div className="col-span-12 md:col-span-4">
          <Suspense fallback={<ChannelChartSkeleton />}>
            {/* Este componente aguarda a promise 'salesByChannelData' resolver.
              Ele é renderizado no servidor.
            */}
            <SalesByChannelChartLoader promise={salesByChannelData} />
          </Suspense>
        </div>

        {/* Card 2: Tabela de Mapa de Calor (CU 5) */}
        <div className="col-span-12 md:col-span-3">
          <Suspense fallback={<HeatmapTableSkeleton />}>
            {/* Este componente aguarda a promise 'salesHeatmapData' resolver.
              Ele é renderizado no servidor.
            */}
            <SalesHeatmapTableLoader promise={salesHeatmapData} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// --- Componentes Loader Assíncronos ---
// Este padrão permite que os dados sejam buscados (await) dentro
// do componente, facilitando o 'Suspense'.

async function SalesByChannelChartLoader({
  promise,
}: {
  promise: ReturnType<typeof api.getSalesByChannel>;
}) {
  const data = await promise;
  return <SalesByChannelChart data={data} />;
}

async function SalesHeatmapTableLoader({
  promise,
}: {
  promise: ReturnType<typeof api.getSalesHeatmap>;
}) {
  const data = await promise;
  return <SalesHeatmapTable data={data} />;
}

