'use client'

import React from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts' // Removido Legend e PieLabelRenderProps
import { SalesByPaymentType } from '@/lib/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExplainDataButton } from '../explain-data-button'
import { formatCurrency } from '@/lib/utils' // Importando helper global

// Cores para o gráfico
const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#E36414',
]

// --- 1. FUNÇÃO DE LABEL CUSTOMIZADA (Copiada do de Canais) ---
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

interface SalesByPaymentChartProps {
  data: SalesByPaymentType[]
}

export function SalesByPaymentChart({ data }: SalesByPaymentChartProps) {
  // Prepara os dados para a IA
  const dataContext = `Esta é a distribuição da minha receita total por tipo de pagamento.`
  const dataJson = JSON.stringify(
    data.map((item) => ({
      tipo: item.paymentTypeName,
      receita: item.totalRevenue,
      transacoes: item.totalTransactions,
    })),
  )

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
          // 2. AUMENTAR altura do 'sem dados'
          <div className="flex h-[350px] w-full items-center justify-center text-muted-foreground">
            Nenhum dado de pagamento encontrado.
          </div>
        ) : (
          // 3. AUMENTAR altura do container
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {/* 4. Adicionar MARGENS */}
              <PieChart margin={{ top: 20, right: 60, bottom: 20, left: 60 }}>
                <Tooltip
                  formatter={(value: number, name: string) => {
                    return [formatCurrency(value), name]
                  }}
                />
                {/* <Legend /> REMOVIDO */}
                <Pie
                  data={data}
                  dataKey="totalRevenue"
                  nameKey="paymentTypeName"
                  cx="50%"
                  cy="50%"
                  outerRadius={100} // 5. AUMENTAR raio
                  fill="#8884d8"
                  label={renderCustomizedLabel as any} // 6. USAR novo label
                  labelLine={false} // 7. REMOVER linha padrão
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.paymentTypeId}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        {/* 8. MUDAR Legenda customizada (só nomes) */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 pt-4">
          {data.map((item, index) => (
            <div
              key={item.paymentTypeId}
              className="flex items-center gap-2"
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <Badge variant="outline">{item.paymentTypeName}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}