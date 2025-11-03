'use client'

import React, { useState, useEffect } from 'react'
import { useGlobalState } from '@/contexts/global-state-provider'
import { getTopProductsAction } from '@/lib/actions'
import { TopProduct } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { KpiCard } from '@/components/analytics/kpi-card'
import { TopProductsTable } from '@/components/analytics/tables/top-products-table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

// Componente de Carregamento (Skeleton) atualizado
function ProdutosPageLoader() {
  return (
    <div className="space-y-4">
      {/* Skeletons para os KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
      </div>
      {/* Skeleton para a Tabela */}
      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}

/**
 * Página de Análise de Produtos
 * Refatorada para ser um Client Component.
 */
export default function ProdutosPage() {
  const { dateRange } = useGlobalState()
  const [data, setData] = useState<TopProduct[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const productData = await getTopProductsAction(dateRange)
        setData(productData)
      } catch (error) {
        console.error('Erro ao buscar dados de produtos:', error)
        setData(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [dateRange])

  // 5. Renderizar o Loader
  if (isLoading || !data) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Análise de Produtos
          </h2>
        </div>
        <ProdutosPageLoader />
      </div>
    )
  }

  // 6. Se os dados existirem, CALCULAR KPIs e renderizar
  const hasData = data.length > 0

  // KPI 1: Produto Destaque
  const topProduct = hasData ? data[0] : { name: 'N/A', totalRevenue: 0 }
  const topProductValue = formatCurrency(topProduct.totalRevenue)

  // KPI 2: Receita Total da Lista
  const totalRevenueOnList = data.reduce(
    (sum, product) => sum + product.totalRevenue,
    0,
  )
  const totalRevenueOnListValue = formatCurrency(totalRevenueOnList)

  // --- NOVA SUGESTÃO (KPI 3) ---
  // KPI 3: Total de Itens Vendidos (Top 100)
  const totalItemsSold = data.reduce(
    (sum, product) => sum + product.totalSold,
    0,
  )
  const totalItemsSoldValue = totalItemsSold.toLocaleString('pt-BR')

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Análise de Produtos</h2>
      </div>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard
          title={hasData ? topProduct.name : 'Produto Destaque'}
          value={topProductValue}
          description="Produto que mais gerou receita"
          size="default"
        />
        <KpiCard
          title="Receita (Top 10)"
          value={totalRevenueOnListValue}
          description="Soma da receita dos produtos na lista"
          size="default"
        />
        {/* --- KPI 3 ATUALIZADO --- */}
        <KpiCard
          title="Itens Vendidos (Top 10)"
          value={totalItemsSoldValue}
          description="Soma de unidades vendidas da lista"
          size="default"
        />
      </div>

      {/* Grid de Componentes (Tabela) */}
      <div className="grid grid-cols-1 gap-4">
        {/* Card: Tabela de Top Produtos */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
            <CardDescription>
              Os produtos que mais geraram receita no período selecionado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TopProductsTable products={data} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}