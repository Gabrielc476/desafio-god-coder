'use client'

import React from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts'
import { SalesByChannel } from '@/lib/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExplainDataButton } from '../explain-data-button'
import { formatCurrency } from '@/lib/utils'

// Cores para o gráfico
const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#E36414',
]

// --- FUNÇÃO DE LABEL CUSTOMIZADA ---
const RADIAN = Math.PI / 180
interface CustomLabelProps {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
  value: number
}
const renderCustomizedLabel = (props: CustomLabelProps) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, value } = props

  // Não renderiza labels para fatias muito pequenas
  if (percent < 0.03) return null

  // Posição para a Porcentagem (dentro da fatia)
  const radiusPercent = innerRadius + (outerRadius - innerRadius) * 0.55
  const xPercent = cx + radiusPercent * Math.cos(-midAngle * RADIAN)
  const yPercent = cy + radiusPercent * Math.sin(-midAngle * RADIAN)

  // Condição para renderizar as linhas e valores externos
  if (percent > 0.05) {
    const radiusValue = outerRadius + 25
    const xValue = cx + radiusValue * Math.cos(-midAngle * RADIAN)
    const yValue = cy + radiusValue * Math.sin(-midAngle * RADIAN)
    const xLineStart = cx + outerRadius * Math.cos(-midAngle * RADIAN)
    const yLineStart = cy + outerRadius * Math.sin(-midAngle * RADIAN)
    const xLineEnd = cx + (outerRadius + 15) * Math.cos(-midAngle * RADIAN)
    const yLineEnd = cy + (outerRadius + 15) * Math.sin(-midAngle * RADIAN)
    const textAnchor = xValue > cx ? 'start' : 'end'

    return (
      <g>
        <text
          x={xPercent}
          y={yPercent}
          fill="white"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fontWeight="bold"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
        <path
          d={`M${xLineStart},${yLineStart}L${xLineEnd},${yLineEnd}L${xValue},${yValue}`}
          stroke="#999"
          fill="none"
        />
        <circle cx={xLineStart} cy={yLineStart} r={2} fill="#999" />
        <text
          x={xValue}
          y={yValue}
          fill="#666"
          textAnchor={textAnchor}
          dominantBaseline="central"
          fontSize={12}
        >
          {formatCurrency(value)}
        </text>
      </g>
    )
  } else {
    // Para fatias menores, mostra só a porcentagem (sem linha)
    return (
      <text
        x={xPercent}
        y={yPercent}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }
}
// --- FIM DA FUNÇÃO DE LABEL ---

interface SalesByChannelChartProps {
  data: SalesByChannel[]
}

export function SalesByChannelChart({ data }: SalesByChannelChartProps) {
  const dataContext = `Esta é a distribuição da minha receita total por canal de venda (iFood, Rappi, Salão, etc).`
  const dataJson = JSON.stringify(
    data.map((item) => ({
      canal: item.channelName,
      receita: item.totalRevenue,
      pedidos: item.totalSales,
    })),
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Receita por Canal</CardTitle>
          <CardDescription>
            Distribuição da receita por canal de venda.
          </CardDescription>
        </div>
        <ExplainDataButton dataContext={dataContext} dataJson={dataJson} />
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          // *** MUDANÇA 1: Aumentei a altura do 'sem dados' ***
          <div className="flex h-[350px] w-full items-center justify-center text-muted-foreground">
            Nenhum dado de canal encontrado.
          </div>
        ) : (
          // *** MUDANÇA 2: Aumentei a altura do container do gráfico ***
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 60, bottom: 20, left: 60 }}>
                <Tooltip
                  formatter={(value: number, name: string) => {
                    return [formatCurrency(value), name]
                  }}
                />
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel as any}
                  // *** MUDANÇA 3: Aumentei o raio do gráfico ***
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="totalRevenue"
                  nameKey="channelName"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.channelId}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        {/* LEGENDA CUSTOMIZADA (só com nomes) */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 pt-4">
          {data.map((item, index) => (
            <div key={item.channelId} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <Badge variant="outline">{item.channelName}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}