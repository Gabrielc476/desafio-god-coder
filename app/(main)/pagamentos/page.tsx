'use client'

import React, { useState, useEffect } from 'react'
import { useGlobalState } from '@/contexts/global-state-provider'
import { getPagamentosDataAction, PagamentosData } from '@/lib/actions'
import { SalesByPaymentChart } from '@/components/analytics/charts/sales-by-payment-chart'
import {
  SalesByPaymentTable,
  SalesByPaymentTableLoader,
} from '@/components/analytics/tables/sales-by-payment-table' // 1. Importar Tabela
import { KpiCard } from '@/components/analytics/kpi-card' // 2. Importar KPI Card
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils' // 3. Importar helper de formatação

// 4. Atualizar o Loader da página
function PagamentosPageLoader() {
  return (
    <div className="space-y-4">
      {/* Skeletons para os KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
      </div>
      {/* Skeletons para Gráfico e Tabela */}
      <div className="grid grid-cols-1 gap-4">
        <Skeleton className="h-[450px] w-full" />
        <SalesByPaymentTableLoader />
      </div>
    </div>
  )
}

export default function PagamentosPage() {
  const { dateRange } = useGlobalState()
  const [data, setData] = useState<PagamentosData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const pagamentosData = await getPagamentosDataAction(dateRange)
        setData(pagamentosData)
      } catch (error) {
        console.error('Erro ao buscar dados de pagamentos:', error)
        setData(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [dateRange])

  // 5. Renderizar o Loader da página
  if (isLoading || !data) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Análise de Pagamentos
          </h2>
        </div>
        <PagamentosPageLoader />
      </div>
    )
  }

  // 6. Calcular KPIs se os dados existirem
  const { salesByPaymentType } = data
  const hasData = salesByPaymentType.length > 0

  // KPI 1: Método Destaque
  const topPayment = hasData
    ? salesByPaymentType.reduce((max, p) =>
        p.totalRevenue > max.totalRevenue ? p : max,
      )
    : { paymentTypeName: 'N/A', totalRevenue: 0 }
  const topPaymentValue = formatCurrency(topPayment.totalRevenue)

  // KPI 2: Total de Transações
  const totalTransactions = hasData
    ? salesByPaymentType.reduce((sum, p) => sum + p.totalTransactions, 0)
    : 0
  const totalTransactionsValue = totalTransactions.toLocaleString('pt-BR')

  // KPI 3: Métodos Utilizados
  const paymentMethodsCount = salesByPaymentType.length.toString()

  // 7. Renderizar os Componentes (KPIs + Gráfico + Tabela)
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Análise de Pagamentos
        </h2>
      </div>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard
          title={hasData ? topPayment.paymentTypeName : 'Método Destaque'}
          value={topPaymentValue}
          description="Método com maior receita no período"
          size="default"
        />
        <KpiCard
          title="Total de Transações"
          value={totalTransactionsValue}
          description="Soma de transações de todos os métodos"
          size="default"
        />
        <KpiCard
          title="Métodos Utilizados"
          value={paymentMethodsCount}
          description="Formas de pagamento registradas"
          size="default"
        />
      </div>

      {/* Grid de Gráfico e Tabela */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <SalesByPaymentChart data={salesByPaymentType} />
        </div>
        <div>
          <SalesByPaymentTable payments={salesByPaymentType} />
        </div>
      </div>
    </div>
  )
}