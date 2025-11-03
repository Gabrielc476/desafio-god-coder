'use client'

// Removido 'useEffect' e 'useState', não são mais necessários
import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SalesByPaymentType } from '@/lib/types'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  PieLabelRenderProps,
} from 'recharts'
import { ExplainDataButton } from './explain-data-button'
import { Badge } from '@/components/ui/badge'

// *** A CORREÇÃO ***
// Trocamos as cores CSS (que eram pretas) por um
// array de cores vibrantes e estáticas.
const COLORS = [
  '#0088FE', // Azul
  '#00C49F', // Verde
  '#FFBB28', // Amarelo
  '#FF8042', // Laranja
  '#8884D8', // Roxo
  '#E36414', // Vermelho
]

// (As funções getCssVariableValue e BASE_COLORS_HSL foram removidas)

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// Type-guard para 'percent'
const renderCustomizedLabel = (props: PieLabelRenderProps) => {
  const { percent } = props
  if (typeof percent !== 'number' || percent === 0) {
    return ''
  }
  return `${(percent * 100).toFixed(0)}%`
}

interface SalesByPaymentChartProps {
  data: SalesByPaymentType[]
}

export function SalesByPaymentChart({ data }: SalesByPaymentChartProps) {
  // (O estado 'resolvedColors' e o 'useEffect' foram removidos)

  // Prepara os dados para a IA (Corrigido para camelCase)
  const dataContext = `Esta é a distribuição da minha receita total por tipo de pagamento.`
  const dataJson = JSON.stringify(
    data.map((item) => ({
      tipo: item.paymentTypeName,
      receita: item.totalRevenue,
      transacoes: item.totalTransactions,
    }))
  )

  // (O 'if (resolvedColors.length === 0)' foi removido)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Receita por Pagamento</CardTitle>
          <CardDescription>
            Distribuição da receita por tipo de pagamento.
          </CardDescription>
        </div>
        <ExplainDataButton dataContext={dataContext} dataJson={dataJson} />
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
            Nenhum dado de pagamento encontrado.
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(value: number, name: string) => {
                    return [formatCurrency(value), name]
                  }}
                />
                <Legend />
                <Pie
                  data={data}
                  dataKey="totalRevenue"
                  nameKey="paymentTypeName"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  // fill="#8884d8" // <-- Removido
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.paymentTypeId}`}
                      // Usamos o array de cores estático
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="flex flex-wrap gap-2 pt-4">
          {data.map((item, index) => (
            <div
              key={item.paymentTypeId}
              className="flex items-center gap-2"
            >
              <span
                className="h-3 w-3 rounded-full"
                // Usamos o array de cores estático
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm font-medium">
                {item.paymentTypeName}:
              </span>
              <Badge variant="secondary">
                {formatCurrency(item.totalRevenue)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}