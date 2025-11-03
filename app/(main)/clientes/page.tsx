import { api } from '@/lib/api'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { RfmCustomersTable } from '@/components/analytics/tables/rfm-customers-table'
import { KpiCard } from '@/components/analytics/kpi-card' // 1. Importar KpiCard
import { Skeleton } from '@/components/ui/skeleton' // 2. Importar Skeleton
import { formatCurrency } from '@/lib/utils' // 3. Importar formatação

// Define a interface para os searchParams
interface ClientesPageProps {
  searchParams: { [key: string]: string | undefined }
}

// Componente Loader atualizado para incluir os KPIs
function ClientesPageLoader() {
  return (
    <div className="space-y-4">
      {/* Skeletons para os KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
      </div>
      {/* Skeleton para a Tabela */}
      <div className="flex h-[400px] w-full items-center justify-center rounded-lg border border-dashed">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </div>
  )
}

// Componente de dados assíncrono (renomeado para clareza)
async function ClientesData({
  startDate,
  endDate,
}: {
  startDate: string
  endDate: string
}) {
  // 1. Buscar os dados (RfmCustomer[])
  const data = await api.getRfmCustomers({ from: startDate, to: endDate })

  // 2. Calcular os KPIs
  const totalClientes = data.length
  let ltvMedio = 0
  let freqMedia = 0

  if (totalClientes > 0) {
    // Calcular LTV Médio (do campo monetaryValue)
    const totalLTV = data.reduce((sum, c) => sum + c.monetaryValue, 0)
    ltvMedio = totalLTV / totalClientes

    // Calcular Frequência Média
    const totalFreq = data.reduce((sum, c) => sum + c.frequency, 0)
    freqMedia = totalFreq / totalClientes
  }

  // 3. Renderizar KPIs e a Tabela
  return (
    <div className="space-y-4">
      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard
          title="Total de Clientes"
          value={totalClientes.toLocaleString('pt-BR')}
          description="Clientes únicos no período"
          size="default"
        />
        <KpiCard
          title="LTV Médio"
          value={formatCurrency(ltvMedio)}
          description="Valor médio gasto por cliente"
          size="default"
        />
        <KpiCard
          title="Frequência Média"
          value={freqMedia.toFixed(1).replace('.', ',')} // Formata para 1 casa decimal
          description="Média de pedidos por cliente"
          size="default"
        />
      </div>

      {/* Tabela de Clientes */}
      <RfmCustomersTable customers={data} />
    </div>
  )
}

export default async function ClientesPage({ searchParams }: ClientesPageProps) {
  const { from: startDate, to: endDate } = api.parseDateRange(searchParams)

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Análise de Clientes (RFM)
        </h2>
      </div>

      {/* Grid de Componentes */}
      <div className="grid grid-cols-1 gap-4">
        {/* Usamos Suspense para carregar KPIs e Tabela juntos */}
        <Suspense
          key={startDate + endDate} // Chave única para forçar o re-render
          fallback={<ClientesPageLoader />} // 4. Usar o novo loader
        >
          {/* 5. Chamar o componente de dados atualizado */}
          <ClientesData startDate={startDate} endDate={endDate} />
        </Suspense>
      </div>
    </div>
  )
}