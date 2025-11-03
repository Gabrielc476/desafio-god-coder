'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { RevenueDataPoint } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  CartesianGrid,
  Cell, // Importar o 'Cell'
} from 'recharts'
import { ExplainDataButton } from '../explain-data-button'

// 1. Definir as *classes* CSS
const CLASS_HIGH = 'revenue-bar-high'
const CLASS_MEDIUM = 'revenue-bar-medium'
const CLASS_LOW = 'revenue-bar-low'

interface RevenueChartProps {
  data: RevenueDataPoint[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  const dataContext =
    'Estes são os dados de faturamento ao longo do tempo para o período selecionado.'

  const chartData = data.map((item) => ({
    ...item,
    date: formatDate(item.date),
    totalRevenue: Number(item.totalRevenue),
  }))

  const dataJson = JSON.stringify(
    chartData.map((item) => ({
      data: item.date,
      receita: item.totalRevenue,
    })),
  )

  // 2. Calcular a média e os thresholds
  const totalRevenue = chartData.reduce(
    (sum, item) => sum + item.totalRevenue,
    0,
  )
  const avgRevenue = totalRevenue / (chartData.length || 1)
  const HIGH_THRESHOLD = avgRevenue * 1.2
  const LOW_THRESHOLD = avgRevenue * 0.8

  // 3. Função helper para definir a *CLASSE*
  const getBarClass = (value: number) => {
    if (value >= HIGH_THRESHOLD) {
      return CLASS_HIGH
    }
    if (value < LOW_THRESHOLD) {
      return CLASS_LOW
    }
    return CLASS_MEDIUM
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Receita no Período</CardTitle>
          <CardDescription>
            Receita diária total no período selecionado.
          </CardDescription>
        </div>
        <ExplainDataButton dataContext={dataContext} dataJson={dataJson} />
      </CardHeader>
      <CardContent className="h-[300px] w-full">
        {chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />

              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip
                // 'wrapperStyle' REMOVIDO. O CSS global cuida disso.
                contentStyle={{
                  backgroundColor: '#0384fc',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
                labelFormatter={(label) => `Data: ${label}`}
                formatter={(value: number) => [
                  formatCurrency(value),
                  'Receita',
                ]}
              />
              {/* O <Bar> usa <Cell> com 'className' */}
              <Bar dataKey="totalRevenue" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    // Aplicamos a classe aqui. O CSS global vai forçar a cor.
                    className={getBarClass(entry.totalRevenue)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            Nenhum dado encontrado para o período.
          </div>
        )}
      </CardContent>
    </Card>
  )
}