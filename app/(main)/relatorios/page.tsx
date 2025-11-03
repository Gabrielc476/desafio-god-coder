// app/(main)/relatorios/page.tsx
'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useGlobalState } from '@/contexts/global-state-provider'
import { getDynamicReportAction, DynamicReportParams } from '@/lib/actions'
import { DynamicReportTable } from '@/components/analytics/tables/dynamic-report-table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ColumnDef } from '@tanstack/react-table'
import { MultiSelect, MultiSelectOption } from '@/components/ui/multi-select' // NOVO
import { DynamicReportChart } from '@/components/analytics/charts/dynamic-report-chart' // NOVO

// Helpers de Formatação
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

// --- Definições para os Seletores ---

type DimensionKey = DynamicReportParams['dimension']

// Mapeamento de TODAS as colunas possíveis (Dimensões e Métricas)
// Isso nos ajuda a construir a tabela e o gráfico dinamicamente
const COLUMN_DEFINITIONS: Record<string, ColumnDef<any>> = {
  // Dimensões (usadas para agrupar e como eixo X)
  product: { accessorKey: 'name', header: 'Produto' },
  channel: { accessorKey: 'channelName', header: 'Canal' },
  payment: { accessorKey: 'paymentTypeName', header: 'Tipo de Pagamento' },
  customer: { accessorKey: 'customerName', header: 'Cliente' },
  time: {
    accessorKey: 'date',
    header: 'Data',
    cell: ({ row }) => formatDate(row.original.date),
  },

  // Métricas (usadas como valores)
  totalSold: { accessorKey: 'totalSold', header: 'Vendas' },
  totalRevenue: {
    accessorKey: 'totalRevenue',
    header: 'Receita',
    cell: ({ row }) => formatCurrency(row.original.totalRevenue),
  },
  totalSales: { accessorKey: 'totalSales', header: 'Pedidos' },
  totalTransactions: {
    accessorKey: 'totalTransactions',
    header: 'Transações',
  },
  frequency: { accessorKey: 'frequency', header: 'Pedidos' },
  monetaryValue: {
    accessorKey: 'monetaryValue',
    header: 'Receita Total',
    cell: ({ row }) => formatCurrency(row.original.monetaryValue),
  },
}

// Mapeamento de MÉTRICAS disponíveis por DIMENSÃO
// Isso é crucial, pois cada dimensão retorna um conjunto diferente de métricas
const METRICS_BY_DIMENSION: Record<DimensionKey, MultiSelectOption[]> = {
  product: [
    { value: 'totalSold', label: 'Vendas' },
    { value: 'totalRevenue', label: 'Receita' },
  ],
  channel: [
    { value: 'totalSales', label: 'Pedidos' },
    { value: 'totalRevenue', label: 'Receita' },
  ],
  payment: [
    { value: 'totalTransactions', label: 'Transações' },
    { value: 'totalRevenue', label: 'Receita' },
  ],
  customer: [
    { value: 'frequency', label: 'Pedidos' },
    { value: 'monetaryValue', label: 'Receita Total' },
  ],
  time: [{ value: 'totalRevenue', label: 'Receita' }],
}

// Helper para criar um mapa de labels de métricas (para o gráfico)
const buildMetricLabels = (options: MultiSelectOption[]) => {
  return options.reduce(
    (acc, opt) => {
      acc[opt.value] = opt.label
      return acc
    },
    {} as Record<string, string>
  )
}

/**
 * Página do Construtor de Relatórios
 */
export default function RelatoriosPage() {
  const { dateRange } = useGlobalState()

  // --- Estados ---
  const [dimension, setDimension] = useState<DimensionKey>('product')
  const [metricOptions, setMetricOptions] = useState<MultiSelectOption[]>(
    METRICS_BY_DIMENSION.product
  )
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(
    METRICS_BY_DIMENSION.product.map((opt) => opt.value) // Inicia com todas selecionadas
  )
  const [vizType, setVizType] = useState<'table' | 'bar'>('table')

  // Estado para os dados
  const [reportData, setReportData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Efeito para atualizar as métricas disponíveis quando a dimensão muda
  useEffect(() => {
    const newOptions = METRICS_BY_DIMENSION[dimension]
    setMetricOptions(newOptions)
    setSelectedMetrics(newOptions.map((opt) => opt.value)) // Reseta a seleção
    setReportData([]) // Limpa os dados antigos
  }, [dimension])

  // --- Memos para renderização ---

  // Memoiza as colunas da tabela
  const memoizedColumns = useMemo(() => {
    const dimensionColumn = COLUMN_DEFINITIONS[dimension]
    const metricColumns = selectedMetrics.map(
      (metricKey) => COLUMN_DEFINITIONS[metricKey]
    )
    return [dimensionColumn, ...metricColumns].filter(Boolean) // Filtra nulos
  }, [dimension, selectedMetrics])

  // O ID da coluna que o filtro de texto deve usar
  const filterColumnId = useMemo(
    () => (COLUMN_DEFINITIONS[dimension]?.accessorKey as string) || 'name',
    [dimension]
  )
  
  // Labels para o gráfico
  const metricLabels = useMemo(() => buildMetricLabels(metricOptions), [metricOptions])

  // Função para buscar os dados (NÃO MUDOU)
  const handleGenerateReport = async () => {
    setIsLoading(true)
    setReportData([]) // Limpa dados antigos
    try {
      // A action é a MESMA. Ela busca a dimensão e
      // o backend retorna TODAS as métricas associadas.
      const data = await getDynamicReportAction({ dimension, dateRange })
      setReportData(data)
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Construtor de Relatórios
        </h2>
      </div>

      {/* 1. Painel de Controle ATUALIZADO */}
      <Card>
        <CardHeader>
          <CardTitle>Configurar Relatório</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Seletor de Dimensão (ÚNICO) */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="dimension">Agrupar por:</label>
              <Select
                value={dimension}
                onValueChange={(value) => setDimension(value as DimensionKey)}
              >
                <SelectTrigger id="dimension" className="w-full">
                  <SelectValue placeholder="Selecione uma dimensão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Produtos</SelectItem>
                  <SelectItem value="channel">Canais</SelectItem>
                  <SelectItem value="payment">Tipos de Pagamento</SelectItem>
                  <SelectItem value="customer">Clientes</SelectItem>
                  <SelectItem value="time">Tempo (Dia)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Seletor de Métricas (MÚLTIPLO) */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="metrics">Analisar (Métricas):</label>
              <MultiSelect
                options={metricOptions}
                selected={selectedMetrics}
                onChange={setSelectedMetrics}
                placeholder="Selecione métricas..."
                className="w-full"
              />
            </div>
            
            {/* Seletor de Visualização (Tabela/Gráfico) */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="vizType">Visualizar como:</label>
              <Select
                value={vizType}
                onValueChange={(value) =>
                  setVizType(value as 'table' | 'bar')
                }
              >
                <SelectTrigger id="vizType" className="w-full">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="table">Tabela</SelectItem>
                  <SelectItem value="bar">Gráfico de Barras</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>

          <div className="flex justify-end">
            <Button onClick={handleGenerateReport} disabled={isLoading}>
              {isLoading ? 'Gerando...' : 'Gerar Relatório'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2. Área de Visualização ATUALIZADA */}
      {isLoading ? (
        <Skeleton className="h-[400px] w-full" />
      ) : reportData.length > 0 ? (
        <>
          {/* Renderização Condicional */}
          {vizType === 'table' ? (
            <DynamicReportTable
              columns={memoizedColumns}
              data={reportData}
              filterColumnId={filterColumnId}
            />
          ) : (
            <DynamicReportChart
              data={reportData}
              xAxisKey={filterColumnId} // O 'filterColumnId' é o 'accessorKey' da dimensão
              metricKeys={selectedMetrics}
              metricLabels={metricLabels}
            />
          )}
        </>
      ) : (
        !isLoading && (
           <Card className="h-[400px] flex items-center justify-center">
             <CardContent className="pt-6">
               <p className="text-muted-foreground text-center">
                Selecione suas configurações e clique em "Gerar Relatório".
               </p>
             </CardContent>
           </Card>
        )
      )}
    </div>
  )
}