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
import { SalesByChannel } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { ExplainDataButton } from '../explain-data-button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils' // Importando o helper global

interface SalesByChannelTableProps {
  channels: SalesByChannel[]
}

export function SalesByChannelTable({ channels }: SalesByChannelTableProps) {
  // Calcular o total de receita para o percentual
  const totalRevenueAllChannels = channels.reduce(
    (acc, c) => acc + c.totalRevenue,
    0,
  )

  // Prepara os dados para a IA
  const dataContext = `Estes são os meus dados de vendas por canal (como iFood, Rappi, Salão) no período selecionado, ordenados por receita.`
  const dataJson = JSON.stringify(
    channels.map((c) => {
      const revenuePercentage =
        totalRevenueAllChannels > 0
          ? (c.totalRevenue / totalRevenueAllChannels) * 100
          : 0

      return {
        canal: c. channelName,
        receita: c.totalRevenue,
        pedidos: c.totalSales,
        percentualReceita: `${revenuePercentage.toFixed(1)}%`,
      }
    }),
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Receita por Canal</CardTitle>
          <CardDescription>
            Valores detalhados por canal no período.
          </CardDescription>
        </div>
        <ExplainDataButton dataContext={dataContext} dataJson={dataJson} />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Canal</TableHead>
              <TableHead className="text-right">Receita Total</TableHead>
              <TableHead className="text-right">Pedidos</TableHead>
              <TableHead className="text-right">% da Receita</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {channels.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-4 text-center text-muted-foreground"
                >
                  Nenhum canal encontrado no período.
                </TableCell>
              </TableRow>
            )}
            {channels.map((channel) => {
              const revenuePercentage =
                totalRevenueAllChannels > 0
                  ? (channel.totalRevenue / totalRevenueAllChannels) * 100
                  : 0

              return (
                // Usando 'name' como chave, assumindo que é único
                <TableRow key={channel. channelName}>
                  <TableCell className="font-medium">{channel. channelName}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(channel.totalRevenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    {channel.totalSales.toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">
                      {revenuePercentage.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// Componente de Skeleton para a nova tabela
export function SalesByChannelTableLoader() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}