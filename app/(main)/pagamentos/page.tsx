import { Suspense } from 'react';
import { api } from '@/lib/api';
import { SalesByPaymentChart } from '@/components/analytics/sales-by-payment-chart';
import { Skeleton } from '@/components/ui/skeleton';

// Componente de Carregamento (Loading Skeleton) para o Gráfico
function PaymentChartSkeleton() {
  return <Skeleton className="h-[350px] w-full" />;
}

// Tipagem explícita dos searchParams
type PagamentosPageProps = {
  searchParams: { [key: string]: string | undefined };
};

/**
 * Página de Análise de Pagamentos (Caso de Uso 6)
 * Esta é um Server Component (RSC) assíncrona.
 */
export default async function PagamentosPage({
  searchParams,
}: PagamentosPageProps) {
  // Pega o 'from' e 'to' da URL, ou usa o default de 30 dias
  const { from, to } = api.parseDateRange(searchParams);

  // Inicia a busca de dados
  const salesByPaymentData = api.getSalesByPaymentType({ from, to });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Análise por Pagamento
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Card 1: Gráfico de Vendas por Tipo de Pagamento (CU 6) */}
        <div className="col-span-12 md:col-span-1">
          <Suspense fallback={<PaymentChartSkeleton />}>
            {/* Este componente aguarda a promise 'salesByPaymentData' resolver.
              Ele é renderizado no servidor.
            */}
            <SalesByPaymentChartLoader promise={salesByPaymentData} />
          </Suspense>
        </div>

        {/* Podemos adicionar mais análises de pagamento aqui no futuro,
           como "valor médio por tipo de pagamento" etc. 
           Por enquanto, o gráfico ocupa a largura.
        */}
      </div>
    </div>
  );
}

// --- Componente Loader Assíncrono ---
async function SalesByPaymentChartLoader({
  promise,
}: {
  promise: ReturnType<typeof api.getSalesByPaymentType>;
}) {
  const data = await promise;
  return <SalesByPaymentChart data={data} />;
}
