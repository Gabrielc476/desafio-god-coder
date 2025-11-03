'use client'

import React, { useState, useEffect } from 'react'
import { useGlobalState } from '@/contexts/global-state-provider'
import { getCanaisDataAction, CanaisData } from '@/lib/actions'
import { SalesByChannelChart } from '@/components/analytics/charts/sales-by-channel-chart'
import {
  SalesByChannelTable,
  SalesByChannelTableLoader,
} from '@/components/analytics/tables/sales-by-channel-table'
import { KpiCard } from '@/components/analytics/kpi-card' // 1. Importar KPI Card
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils' // 2. Importar helper de formatação

// 3. Criar um Loader para a página inteira (KPIs + Gráfico + Tabela)
function CanaisPageLoader() {
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
        <SalesByChannelTableLoader />
      </div>
    </div>
  )
}

export default function CanaisPage() {
  const { dateRange } = useGlobalState()
  const [data, setData] = useState<CanaisData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const canaisData = await getCanaisDataAction(dateRange)
        setData(canaisData)
      } catch (error) {
        console.error('Erro ao buscar dados de canais:', error)
        setData(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [dateRange])

  // 4. Renderizar o Loader da página
  if (isLoading || !data) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Análise de Canais</h2>
        </div>
        <CanaisPageLoader />
      </div>
    )
  }

  // 5. Calcular KPIs se os dados existirem
  const { salesByChannel } = data
  const hasData = salesByChannel.length > 0

  // KPI 1: Canal Destaque
  const topChannel = hasData
    ? salesByChannel.reduce((max, channel) =>
        channel.totalRevenue > max.totalRevenue ? channel : max,
      )
    : { channelName: 'N/A', totalRevenue: 0 }
  const topChannelValue = formatCurrency(topChannel.totalRevenue)

  // KPI 2: Total de Pedidos
  const totalOrders = hasData
    ? salesByChannel.reduce((sum, channel) => sum + channel.totalSales, 0)
    : 0
  const totalOrdersValue = totalOrders.toLocaleString('pt-BR')

  // KPI 3: Canais Ativos
  const activeChannelsValue = salesByChannel.length.toString()

  // 6. Renderizar os Componentes (KPIs + Gráfico + Tabela)
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Análise de Canais</h2>
      </div>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard
          title={hasData ? topChannel.channelName : 'Canal Destaque'}
          value={topChannelValue}
          description="Canal com maior receita no período"
          size="default"
        />
        <KpiCard
          title="Total de Pedidos"
          value={totalOrdersValue}
          description="Soma de pedidos de todos os canais"
          size="default"
        />
        <KpiCard
          title="Canais Ativos"
          value={activeChannelsValue}
          description="Canais que registraram vendas"
          size="default"
        />
      </div>

      {/* Grid de Gráfico e Tabela */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <SalesByChannelChart data={salesByChannel} />
        </div>
        <div>
          <SalesByChannelTable channels={salesByChannel} />
        </div>
      </div>
    </div>
  )
}