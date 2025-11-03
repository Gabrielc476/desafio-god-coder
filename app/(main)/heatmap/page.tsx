'use client'

import React, { useState, useEffect } from 'react'
import { useGlobalState } from '@/contexts/global-state-provider'
import { getHeatmapDataAction, HeatmapData } from '@/lib/actions' // <-- Nova Action
import { SalesHeatmapChart } from '@/components/analytics/charts/sales-heatmap-chart' // <-- Novo Gráfico
import { SalesHeatmapTable } from '@/components/analytics/tables/sales-heatmap-table' // <-- Tabela Existente
import { Skeleton } from '@/components/ui/skeleton'

// Skeletons para o estado de carregamento
function ChartSkeleton() {
  return <Skeleton className="h-[450px] w-full" />
}
function TableSkeleton() {
  return <Skeleton className="h-[400px] w-full" />
}

/**
 * Página de Análise de Heatmap (Mapa de Calor)
 */
export default function HeatmapPage() {
  const { dateRange } = useGlobalState()
  const [data, setData] = useState<HeatmapData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const heatmapData = await getHeatmapDataAction(dateRange)
        setData(heatmapData)
      } catch (error) {
        console.error('Erro ao buscar dados de heatmap:', error)
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
          <h2 className="text-3xl font-bold tracking-tight">Análise de Horários (Heatmap)</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-1">
          <ChartSkeleton />
          <TableSkeleton />
        </div>
      </div>
    )
  }

  // Renderizar os dados
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Análise de Horários (Heatmap)</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        {/* O novo gráfico de dispersão/bolha */}
        <SalesHeatmapChart data={data.salesHeatmap} />
        
        {/* A tabela que já tínhamos (agora com dados corretos) */}
        <SalesHeatmapTable data={data.salesHeatmap} />
      </div>
    </div>
  )
}