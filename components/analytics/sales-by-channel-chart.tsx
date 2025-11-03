'use client'

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts'
import { SalesByChannel } from '@/lib/types'
// Imports do Card REMOVIDOS (corrigindo os erros do ESLint)
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Cores para o gráfico
const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#E36414',
]

// Helper para formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

interface SalesByChannelChartProps {
  data: SalesByChannel[]
}

export function SalesByChannelChart({ data }: SalesByChannelChartProps) {
  // Formata os dados para o Tooltip
  const chartData = data.map((item) => ({
    ...item,
    formattedRevenue: formatCurrency(item.totalRevenue),
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="totalRevenue" // O valor (correto)
          nameKey="channelName"  // *** CORREÇÃO (já feita) ***
          
          // *** CORREÇÃO DO ERRO 'percent is unknown' ***
          // Adicionamos a tipagem explícita ao argumento
          label={({ percent }: { percent: number }) => 
            `${(percent * 100).toFixed(0)}%`
          }
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name, props) => {
            return [
              props.payload.formattedRevenue, // Valor formatado
              props.payload.channelName,    // Nome (corrigido)
            ]
          }}
          labelFormatter={() => ''} // Oculta o label principal
        />
      </PieChart>
    </ResponsiveContainer>
  )
}