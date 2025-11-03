'use client'

import React, { useState, useEffect } from 'react'

// Hooks e Componentes
import { useGlobalState } from '@/contexts/global-state-provider'
import { getDashboardDataAction, DashboardData } from '@/lib/actions'
import { KpiCard } from '@/components/analytics/kpi-card'
import { RevenueChart } from '@/components/analytics/charts/revenue-chart'
import { TopProductsTable } from '@/components/analytics/tables/top-products-table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

// --- Componente de Loader (Skeleton) ---
function DashboardLoader() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* 1. Altura do Skeleton ajustada para o card maior */}
        <Skeleton className="h-[138px]" />
        <Skeleton className="h-[138px]" />
        <Skeleton className="h-[138px]" />
        <Skeleton className="h-[138px]" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <div className="col-span-1 lg:col-span-4">
          <Skeleton className="h-[400px]" />
        </div>
        <div className="col-span-1 lg:col-span-3">
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    </>
  )
}

// --- Funções Auxiliares ---
const formatCurrency = (value: number | null | undefined) => {
  const numericValue = value || 0
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue)
}

// --- A Página (Client Component) ---

export default function DashboardPage() {
  // ... (lógica de state e effect permanece a mesma) ...
  const { dateRange } = useGlobalState()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const dashboardData = await getDashboardDataAction(dateRange)
        setData(dashboardData)
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error)
        setData(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [dateRange])

  if (isLoading || !data) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <DashboardLoader />
      </div>
    )
  }

  const { averageTicket, topProducts, revenueOverTime, totalRevenue } = data
  const totalOrders = averageTicket.totalSales || 0
  const totalRevenueStr = formatCurrency(totalRevenue)
  const avgTicketStr = formatCurrency(averageTicket.average_ticket)
  const totalOrdersStr = totalOrders.toLocaleString('pt-BR')

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Receita Total"
          value={totalRevenueStr}
          description="Soma de todos os pedidos no período"
          size="large" // 2. Aplicar a prop 'size'
        />
        <KpiCard
          title="Ticket Médio"
          value={avgTicketStr}
          description="Receita total / Pedidos totais"
          size="large" // 2. Aplicar a prop 'size'
        />
        <KpiCard
          title="Pedidos Totais"
          value={totalOrdersStr}
          description="Número total de pedidos concluídos"
          size="large" // 2. Aplicar a prop 'size'
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="col-span-12 lg:col-span-4">
          <CardHeader>
            <CardTitle>Receita no período</CardTitle>
            <CardDescription>
              Receita diária no período selecionado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <RevenueChart data={revenueOverTime} />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-3">
          <CardHeader>
            <CardTitle>Top 10 Produtos</CardTitle>
            <CardDescription>
              Os produtos mais vendidos no período.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TopProductsTable products={topProducts} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}