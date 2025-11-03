'use client'

import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SalesHeatmapPoint } from '@/lib/types'
import { ExplainDataButton } from '../explain-data-button'

// --- MUDANÇA 1: Cores com maior contraste ---
const COLORS = [
  '#0088FE', // Azul (Vibrant Blue)
  '#00C49F', // Verde (Teal)
  '#FFBB28', // Amarelo (Yellow)
  '#FF80E1', // Rosa/Magenta (Pink)
  '#8884D8', // Roxo (Purple)
  '#D92D20', // Vermelho (Strong Red)
]

// Helper para formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// Helper para formatar a hora (eixo X)
const formatHour = (hour: number) => `${hour}:00`

interface SalesHeatmapChartProps {
  data: SalesHeatmapPoint[]
}

export function SalesHeatmapChart({ data }: SalesHeatmapChartProps) {
  // Prepara os dados para a IA
  const dataContext = `Este é um gráfico de dispersão (mapa de calor) que mostra o total de receita por hora do dia, agrupado por canal de venda. O tamanho de cada bolha representa a receita.`
  const dataJson = JSON.stringify(
    data.map((item) => ({
      hora: `${item.hour}:00`,
      canal: item.channelName,
      receita: item.totalRevenue,
    })),
  )

  // Mapeamento de canais para IDs e Cores (lógica existente)
  const uniqueChannels = Array.from(
    new Set(data.map((item) => item.channelName)),
  ).sort()
  const channelNameToId = new Map(
    uniqueChannels.map((name, index) => [name, index]),
  )
  const channelIdToName = new Map(
    uniqueChannels.map((name, index) => [index, name]),
  )

  const formattedData = data.map((item) => ({
    ...item,
    channelId: channelNameToId.get(item.channelName)!,
  }))

  const channelColors = new Map<string, string>()
  uniqueChannels.forEach((name, index) => {
    channelColors.set(name, COLORS[index % COLORS.length])
  })

  return (
    <Card className="col-span-12">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Receita por Canal vs. Hora (Mapa de Calor)</CardTitle>
          <CardDescription>
            Quanto maior a bolha, maior a receita naquele horário e canal.
          </CardDescription>
        </div>
        <ExplainDataButton
          dataContext={dataContext}
          dataJson={dataJson}
        />
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              {/* --- MUDANÇA 2: Ticks (intervalos) de 4 em 4 horas --- */}
              <XAxis
                dataKey="hour"
                type="number"
                domain={[0, 23]}
                tickFormatter={formatHour}
                name="Hora"
                allowDuplicatedCategory={false}
                ticks={[0, 3, 6, 9, 12, 15, 18, 21, 23]} // <-- FORÇA OS INTERVALOS
              />
              <YAxis
                dataKey="channelId"
                type="number"
                domain={[-1, uniqueChannels.length]}
                tickCount={uniqueChannels.length}
                tickFormatter={(tick) => channelIdToName.get(tick) || ''}
                name="Canal"
                allowDuplicatedCategory={false}
              />
              <ZAxis
                dataKey="totalRevenue"
                range={[100, 1000]}
                name="Receita"
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const dataPoint = payload[0].payload
                    const channelName = channelIdToName.get(dataPoint.channelId)
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-md">
                        <p className="text-sm font-bold">
                          {channelName || 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Hora: {dataPoint.hour}:00
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Receita: {formatCurrency(dataPoint.totalRevenue)}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend />

              {/* Renderiza um <Scatter> para cada canal */}
              {uniqueChannels.map((channelName) => {
                const channelData = formattedData.filter(
                  (item) => item.channelName === channelName,
                )
                const color = channelColors.get(channelName) || '#333'

                return (
                  <Scatter
                    key={channelName}
                    name={channelName}
                    data={channelData}
                    fill={color}
                    opacity={0.7}
                  />
                )
              })}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}