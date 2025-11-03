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
import { SalesByPaymentType } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { ExplainDataButton } from '../explain-data-button' // Corrigido o caminho
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'

interface SalesByPaymentTableProps {
  payments: SalesByPaymentType[]
}

export function SalesByPaymentTable({ payments }: SalesByPaymentTableProps) {
  // Calcular o total de receita para o percentual
  const totalRevenueAllPayments = payments.reduce(
    (acc, p) => acc + p.totalRevenue,
    0,
  )

  // Prepara os dados para a IA
  const dataContext = `Estes são os meus dados de vendas por tipo de pagamento no período selecionado, ordenados por receita.`
  const dataJson = JSON.stringify(
    payments.map((p) => {
      const revenuePercentage =
        totalRevenueAllPayments > 0
          ? (p.totalRevenue / totalRevenueAllPayments) * 100
          : 0

      return {
        tipo: p.paymentTypeName,
        receita: p.totalRevenue,
        transacoes: p.totalTransactions, // Usando a propriedade correta
        percentualReceita: `${revenuePercentage.toFixed(1)}%`,
      }
    }),
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Receita por Pagamento</CardTitle>
          <CardDescription>
            Valores detalhados por tipo de pagamento no período.
          </CardDescription>
        </div>
        <ExplainDataButton dataContext={dataContext} dataJson={dataJson} />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo de Pagamento</TableHead>
              <TableHead className="text-right">Receita Total</TableHead>
              <TableHead className="text-right">Transações</TableHead>
              <TableHead className="text-right">% da Receita</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-4 text-center text-muted-foreground"
                >
                  Nenhum pagamento encontrado no período.
                </TableCell>
              </TableRow>
            )}
            {payments.map((payment) => {
              const revenuePercentage =
                totalRevenueAllPayments > 0
                  ? (payment.totalRevenue / totalRevenueAllPayments) * 100
                  : 0

              return (
                <TableRow key={payment.paymentTypeId}>
                  <TableCell className="font-medium">
                    {payment.paymentTypeName}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(payment.totalRevenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    {payment.totalTransactions.toLocaleString('pt-BR')}
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
export function SalesByPaymentTableLoader() {
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