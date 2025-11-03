'use client'

import React, { useState, useMemo } from 'react'
import { useGlobalState } from '@/contexts/global-state-provider'
import { getDynamicReportAction, DynamicReportParams } from '@/lib/actions'
import { DynamicReportTable } from '@/components/analytics/dynamic-report-table'
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

// Lógica para definir as colunas da tabela dinamicamente
function getColumnsForDimension(
  dimension: DynamicReportParams['dimension']
): ColumnDef<any>[] {
  switch (dimension) {
    case 'product':
      return [
        { accessorKey: 'name', header: 'Produto' },
        { accessorKey: 'totalSold', header: 'Vendas' },
        { accessorKey: 'totalRevenue', header: 'Receita', cell: ({ row }) => formatCurrency(row.original.totalRevenue) },
      ]
    case 'channel':
      return [
        { accessorKey: 'channelName', header: 'Canal' },
        { accessorKey: 'totalSales', header: 'Pedidos' },
        { accessorKey: 'totalRevenue', header: 'Receita', cell: ({ row }) => formatCurrency(row.original.totalRevenue) },
      ]
    case 'payment':
      return [
        { accessorKey: 'paymentTypeName', header: 'Tipo de Pagamento' },
        { accessorKey: 'totalTransactions', header: 'Transações' },
        { accessorKey: 'totalRevenue', header: 'Receita', cell: ({ row }) => formatCurrency(row.original.totalRevenue) },
      ]
    case 'customer':
      return [
        { accessorKey: 'customerName', header: 'Cliente' },
        { accessorKey: 'frequency', header: 'Pedidos' },
        { accessorKey: 'monetaryValue', header: 'Receita Total', cell: ({ row }) => formatCurrency(row.original.monetaryValue) },
      ]
    case 'time':
      return [
        { accessorKey: 'date', header: 'Data', cell: ({ row }) => formatDate(row.original.date) },
        { accessorKey: 'totalRevenue', header: 'Receita', cell: ({ row }) => formatCurrency(row.original.totalRevenue) },
      ]
    default:
      return []
  }
}

// O ID da coluna que o filtro de texto deve usar
const getFilterColumnForDimension = (
  dimension: DynamicReportParams['dimension']
) => {
  switch (dimension) {
    case 'product': return 'name'
    case 'channel': return 'channelName'
    case 'payment': return 'paymentTypeName'
    case 'customer': return 'customerName'
    case 'time': return 'date'
  }
}

/**
 * Página do Construtor de Relatórios
 */
export default function RelatoriosPage() {
  const { dateRange } = useGlobalState()
  
  // Estado para os seletores
  const [dimension, setDimension] = 
    useState<DynamicReportParams['dimension']>('product')
  
  // Estado para os dados
  const [reportData, setReportData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Memoiza as colunas e o filtro
  const memoizedColumns = useMemo(() => getColumnsForDimension(dimension), [dimension])
  const filterColumnId = useMemo(() => getFilterColumnForDimension(dimension), [dimension])

  // Função para buscar os dados (chamada pelo botão)
  const handleGenerateReport = async () => {
    setIsLoading(true)
    setReportData([]) // Limpa dados antigos
    try {
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
        <h2 className="text-3xl font-bold tracking-tight">Construtor de Relatórios</h2>
      </div>

      {/* 1. Painel de Controle */}
      <Card>
        <CardHeader>
          <CardTitle>Configurar Relatório</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="dimension">Agrupar por:</label>
            <Select
              value={dimension}
              onValueChange={(value) =>
                setDimension(value as DynamicReportParams['dimension'])
              }
            >
              <SelectTrigger id="dimension" className="w-full md:w-[240px]">
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
          {/* (Poderíamos adicionar um seletor de Métrica aqui no futuro) */}
          <div className="flex flex-col space-y-1.5 justify-end">
            <Button onClick={handleGenerateReport} disabled={isLoading}>
              {isLoading ? 'Gerando...' : 'Gerar Relatório'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2. Área de Visualização */}
      {isLoading ? (
        <Skeleton className="h-[400px] w-full" />
      ) : (
        reportData.length > 0 && (
          <DynamicReportTable
            columns={memoizedColumns}
            data={reportData}
            filterColumnId={filterColumnId}
          />
        )
      )}
    </div>
  )
}