'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
// CORREÇÃO: O import 'SalesHeatmapPoint' agora será usado
import { SalesHeatmapPoint } from '@/lib/types'
import { ExplainDataButton } from '../explain-data-button'

// CORREÇÃO: Movido a interface para fora do componente
interface SalesHeatmapTableProps {
  data: SalesHeatmapPoint[] // CORREÇÃO: Tipagem explícita da prop
}

// Helper para formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Interface para a linha da tabela pivotada
interface PivotRow {
  hour: number
  channels: Record<string, number>
}

export function SalesHeatmapTable({ data }: SalesHeatmapTableProps) {
  // --- Lógica de Transformação (Pivot) ---

  // CORREÇÃO: Tipagem explícita para 'uniqueChannels'
  const uniqueChannels: string[] = Array.from(
    new Set(data.map((item) => item.channelName)),
  ).sort()

  // CORREÇÃO: Tipagem explícita para o Map
  const dataByHour = new Map<number, Record<string, number>>()

  // Inicializar todas as 24 horas e todos os canais com 0
  for (let hour = 0; hour < 24; hour++) {
    const channelData: Record<string, number> = {}
    for (const channel of uniqueChannels) {
      channelData[channel] = 0
    }
    dataByHour.set(hour, channelData)
  }

  // Preencher o mapa com os dados de receita
  for (const item of data) {
    if (dataByHour.has(item.hour)) {
      // O '!' garante ao TS que a chave existe (nós a inicializamos)
      dataByHour.get(item.hour)![item.channelName] = item.totalRevenue
    }
  }

  // Converter o Map para um array de linhas para a tabela
  const tableData: PivotRow[] = Array.from(
    dataByHour,
    ([hour, channels]) => ({
      hour,
      channels,
    }),
  )

  // Preparar dados para a IA (agora com o formato pivotado)
  const dataContext = `Este é um mapa de calor em formato de tabela, mostrando a RECEITA (em R$) por HORA (linhas) e por CANAL (colunas).`
  const dataJson = JSON.stringify(
    tableData.map((row) => ({
      hora: `${row.hour}:00`,
      ...row.channels,
    })),
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Horários de Pico (Receita por Canal)</CardTitle>
          <CardDescription>
            Receita (R$) pivotada por hora e canal de venda.
          </CardDescription>
        </div>
        <ExplainDataButton dataContext={dataContext} dataJson={dataJson} />
      </CardHeader>

      {/* CORREÇÃO: Removido 'max-h-[380px] overflow-y-auto' para a tabela ficar maior */}
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 top-0 z-10 bg-background">
                Hora
              </TableHead>
              {/* Agora 'channel' é 'string', não 'unknown' */}
              {uniqueChannels.map((channel) => (
                <TableHead key={channel} className="text-right">
                  {channel}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={uniqueChannels.length + 1}
                  className="text-center text-muted-foreground"
                >
                  Nenhum dado encontrado no período.
                </TableCell>
              </TableRow>
            )}

            {tableData.map(({ hour, channels }) => (
              <TableRow key={hour}>
                <TableCell className="sticky left-0 bg-background font-medium">
                  {hour.toString().padStart(2, '0')}:00
                </TableCell>
                {/* Agora 'channel' é 'string', não 'unknown' */}
                {uniqueChannels.map((channel) => (
                  <TableCell key={channel} className="text-right">
                    {formatCurrency(channels[channel] || 0)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}