'use client'

import React, { useState, useEffect } from 'react'
import { useGlobalState } from '@/contexts/global-state-provider'
import { getPagamentosDataAction, PagamentosData } from '@/lib/actions' // <-- Importaremos um 'PagamentosData' mais simples
import { SalesByPaymentChart } from '@/components/analytics/sales-by-payment-chart'
import { Skeleton } from '@/components/ui/skeleton'

// Skeletons para o estado de carregamento
function PaymentChartSkeleton() {
  return <Skeleton className="h-[450px] w-full" />
}

/**
 * Página de Análise de Pagamentos (Caso de Uso 6)
 * Refatorada para focar apenas em pagamentos.
 */
export default function PagamentosPage() {
  const { dateRange } = useGlobalState()
  const [data, setData] = useState<PagamentosData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Chama a Server Action (que agora só busca pagamentos)
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

  // Renderizar o Loader
  if (isLoading || !data) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Análise de Pagamentos</h2>
        </div>
        {/* Layout de uma coluna */}
        <div className="grid gap-4 md:grid-cols-1">
          <PaymentChartSkeleton />
        </div>
      </div>
    )
  }

  // Renderizar os dados
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Análise de Pagamentos</h2>
      </div>

      {/* Layout de uma coluna */}
      <div className="grid gap-4 md:grid-cols-1">
        <SalesByPaymentChart data={data.salesByPaymentType} />
      </div>
    </div>
  )
}