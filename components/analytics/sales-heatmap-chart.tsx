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
  Cell,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SalesHeatmapPoint } from '@/lib/types'
import { ExplainDataButton } from './explain-data-button'

// Cores para os canais (as mesmas do gráfico de pizza)
const COLORS = [
  '#0088FE', // Azul
  '#00C49F', // Verde
  '#FFBB28', // Amarelo
  '#FF8042', // Laranja
  '#8884D8', // Roxo
  '#E36414', // Vermelho
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
    }))
  )

  // *** A CORREÇÃO PRINCIPAL: Mapear nomes de canais para IDs numéricos ***
  const uniqueChannels = Array.from(new Set(data.map(item => item.channelName))).sort()
  const channelNameToId = new Map(uniqueChannels.map((name, index) => [name, index]))
  const channelIdToName = new Map(uniqueChannels.map((name, index) => [index, name]))

  // Mapeia os dados brutos para um formato que o Recharts entende no YAxis
  const formattedData = data.map(item => ({
    ...item,
    channelId: channelNameToId.get(item.channelName)!, // Adiciona o ID numérico do canal
  }));

  // Mapeia canais únicos para cores (usado para as bolhas)
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
              <XAxis
                dataKey="hour"
                type="number"
                domain={[0, 23]} // Garante que o eixo vá de 0 a 23
                tickFormatter={formatHour}
                name="Hora"
                allowDuplicatedCategory={false} // Importante para eixos de categoria
              />
              <YAxis
                dataKey="channelId" // *** MUDANÇA: Usamos o ID numérico aqui ***
                type="number"
                domain={[-1, uniqueChannels.length]} // Para espaçamento adequado
                tickCount={uniqueChannels.length}
                tickFormatter={(tick) => channelIdToName.get(tick) || ''} // *** MUDANÇA: Formata para o nome do canal ***
                name="Canal"
                allowDuplicatedCategory={false}
              />
              {/* O ZAxis define qual chave controla o tamanho (range) */}
              <ZAxis
                dataKey="totalRevenue"
                range={[100, 1000]} // Tamanho da bolha (min, max)
                name="Receita"
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                // *** MUDANÇA: Ajuste do formatter para exibir o nome do canal ***
                formatter={(value: any, name: string, props: any) => {
                  if (name === 'Receita') return [formatCurrency(value), name]
                  if (name === 'Hora') return [`${value}:00`, name]
                  if (name === 'Canal') { // Identifica o tick do canal e busca o nome
                    const channelName = channelIdToName.get(value as number)
                    return [channelName || 'N/A', name]
                  }
                  return [value, name]
                }}
                // *** MUDANÇA: Content para exibir o nome do canal no tooltip ***
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const dataPoint = payload[0].payload;
                    const channelName = channelIdToName.get(dataPoint.channelId);
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-md">
                        <p className="text-sm font-bold">{channelName || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">
                          Hora: {dataPoint.hour}:00
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Receita: {formatCurrency(dataPoint.totalRevenue)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Scatter name="Receita por Hora" data={formattedData}> {/* *** MUDANÇA: Usa formattedData *** */}
                {formattedData.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.channelId}-${entry.hour}`} // Chave mais única
                    fill={channelColors.get(entry.channelName) || '#333'}
                    opacity={0.7}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}