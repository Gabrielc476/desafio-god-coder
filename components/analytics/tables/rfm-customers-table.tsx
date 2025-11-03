'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { RfmCustomer } from '@/lib/types' // <-- Importa o novo tipo
import { format, parseISO, differenceInDays, isValid } from 'date-fns' // <-- Imports de data

// Helper para formatar moeda
const formatCurrency = (value: number | null | undefined) => {
  const numericValue = value || 0
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue)
}

// Helper para calcular e formatar a recência (dias desde a última compra)
const getRecencyDays = (dateString: string) => {
  try {
    const lastPurchase = parseISO(dateString)
    if (!isValid(lastPurchase)) {
      return 'N/A'
    }
    // Usamos new Date() como "hoje"
    const days = differenceInDays(new Date(), lastPurchase) 
    return `${days} dias`
  } catch {
    return 'Data inválida'
  }
}

interface RfmCustomersTableProps {
  customers: RfmCustomer[]
}

export function RfmCustomersTable({ customers }: RfmCustomersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {/* *** COLUNAS CORRIGIDAS *** */}
            <TableHead>Cliente</TableHead>
            <TableHead className="text-right">Frequência (Pedidos)</TableHead>
            <TableHead>Última Compra (Recência)</TableHead>
            <TableHead className="text-right">Valor (Receita)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.customerId}> {/* <-- MUDANÇA (key) */}
              
              {/* Células corrigidas para 'camelCase' */}
              <TableCell className="font-medium">
                {customer.customerName}
              </TableCell>

              <TableCell className="text-right">
                {customer.frequency}
              </TableCell>

              <TableCell>
                {getRecencyDays(customer.lastPurchaseDate)}
              </TableCell>

              <TableCell className="text-right">
                {formatCurrency(customer.monetaryValue)}
              </TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}