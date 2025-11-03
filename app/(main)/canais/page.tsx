'use client' // <-- PASSO 1: Transformar em Client Component

import React, { useState, useEffect } from 'react'

// Hooks e Componentes
import { useGlobalState } from '@/contexts/global-state-provider' // <-- O nosso hook global
import {
  getCanaisDataAction,
  CanaisData,
  HeatmapData, // <-- Já importado por você
  getHeatmapDataAction, // <-- Já importado por você
} from '@/lib/actions'
import { SalesByChannelChart } from '@/components/analytics/sales-by-channel-chart'
import { SalesHeatmapTable } from '@/components/analytics/sales-heatmap-table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

// Componente de Carregamento (Loading Skeleton) para o Gráfico
function ChannelChartSkeleton() {
  return <Skeleton className="h-[350px] w-full" />
}

// Componente de Carregamento (Loading Skeleton) para a Tabela
function HeatmapTableSkeleton() {
  return <Skeleton className="h-[400px] w-full" />
}

// *** CORREÇÃO: Criar um tipo combinado para o estado ***
type CanaisPageData = CanaisData & HeatmapData

/**
 * Página de Análise de Canais (Caso de Uso 3 e 5)
 * Refatorada para ser um Client Component.
 */
export default function CanaisPage() {
  // 1. Remover `async` e `searchParams`

  // 2. Usar o contexto para ler a data
  const { dateRange } = useGlobalState()

  // 3. Criar estado para os dados e carregamento
  // *** CORREÇÃO: Usar o novo tipo combinado ***
  const [data, setData] = useState<CanaisPageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 4. Usar useEffect para buscar dados quando `dateRange` mudar
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // *** CORREÇÃO: Buscar AMBOS os conjuntos de dados em paralelo ***
        const [canaisData, heatmapData] = await Promise.all([
          getCanaisDataAction(dateRange),
          getHeatmapDataAction(dateRange),
        ])

        // *** CORREÇÃO: Combinar os resultados no estado ***
        setData({
          salesByChannel: canaisData.salesByChannel,
          salesHeatmap: heatmapData.salesHeatmap,
        })
      } catch (error) {
        console.error('Erro ao buscar dados de canais ou heatmap:', error)
        setData(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [dateRange]) // <-- O gatilho é a mudança no contexto

  // 5. Renderizar o Loader
  if (isLoading || !data) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Análise de Canais</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-12 md:col-span-4">
            <ChannelChartSkeleton />
          </div>
          <div className="col-span-12 md:col-span-3">
            <HeatmapTableSkeleton />
          </div>
        </div>
      </div>
    )
  }

  // 6. Se os dados existirem, renderizar os componentes
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Análise de Canais</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Card 1: Gráfico de Vendas por Canal (CU 3) */}
        <Card className="col-span-12 md:col-span-4">
          <CardHeader>
            <CardTitle>Vendas por Canal</CardTitle>
            <CardDescription>
              Receita total e pedidos por canal de venda no período.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {/* Agora acessa 'data.salesByChannel' */}
            <SalesByChannelChart data={data.salesByChannel} />
          </CardContent>
        </Card>

        {/* Card 2: Tabela de Mapa de Calor (CU 5) */}
        <Card className="col-span-12 md:col-span-3">
          <CardHeader>
            <CardTitle>Horários de Pico</CardTitle>
            <CardDescription>
              Total de pedidos por dia da semana e hora.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Agora acessa 'data.salesHeatmap' */}
            <SalesHeatmapTable data={data.salesHeatmap} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}