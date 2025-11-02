import { api } from '@/lib/api';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { TopProductsTable } from '@/components/analytics/top-products-table';

// Define a interface para os searchParams diretamente aqui
interface ProdutosPageProps {
  searchParams: { [key: string]: string | undefined };
}

// Componente Loader simples (reutilizado)
function TableLoader() {
  return (
    <div className="flex h-[400px] w-full items-center justify-center rounded-lg border border-dashed">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

// Componente de dados assíncrono
async function ProductsTableData({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  const data = await api.getTopProducts({ from: startDate, to: endDate });
  return <TopProductsTable products={data} />;
}

export default async function ProdutosPage({ searchParams }: ProdutosPageProps) {
  // Extrai e define as datas padrão
  const { from: startDate, to: endDate } = api.parseDateRange(searchParams);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Análise de Produtos</h2>
      </div>

      {/* Grid de Componentes */}
      <div className="grid grid-cols-1 gap-4">
        {/* Usamos Suspense para carregar a tabela de produtos */}
        <Suspense
          key={startDate + endDate} // Chave única para forçar o re-render
          fallback={<TableLoader />}
        >
          <ProductsTableData startDate={startDate} endDate={endDate} />
        </Suspense>
      </div>
    </div>
  );
}
