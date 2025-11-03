// components/analytics/charts/dynamic-report-chart.tsx
'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DynamicReportChartProps {
  data: any[]
  // A chave da dimensão (ex: 'name', 'channelName')
  xAxisKey: string
  // As chaves das métricas (ex: ['totalRevenue', 'totalSold'])
  metricKeys: string[]
  // Mapeamento para labels amigáveis (ex: { totalRevenue: 'Receita' })
  metricLabels: Record<string, string>
}

// Helper para formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// Helper para gerar cores para as barras
const COLORS = [
  '#2563eb', // blue-600
  '#ea580c', // orange-600
  '#16a34a', // green-600
  '#ca8a04', // yellow-600
]

export function DynamicReportChart({
  data,
  xAxisKey,
  metricKeys,
  metricLabels,
}: DynamicReportChartProps) {
  
  const isCurrencyChart = metricKeys.some(key => key.includes('Revenue') || key.includes('monetaryValue'));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualização do Relatório</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} tickLine={false} axisLine={false} />
            <YAxis
              tickFormatter={(value) =>
                isCurrencyChart
                  ? formatCurrency(value)
                  : value
              }
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                metricLabels[name]?.includes('Receita') || metricLabels[name]?.includes('Valor')
                  ? formatCurrency(value)
                  : value,
                metricLabels[name] || name,
              ]}
            />
            <Legend />
            {metricKeys.map((metricKey, index) => (
              <Bar
                key={metricKey}
                dataKey={metricKey}
                name={metricLabels[metricKey] || metricKey}
                fill={COLORS[index % COLORS.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}