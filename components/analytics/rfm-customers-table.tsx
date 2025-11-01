'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RfmCustomer } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { ExplainDataButton } from './explain-data-button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RfmCustomersTableProps {
  customers: RfmCustomer[];
}

// Helper para formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Helper para formatar data
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd 'de' MMM, yyyy", { locale: ptBR });
  } catch (error) {
    console.error('Data inválida:', dateString);
    return 'Data inválida';
  }
};

export function RfmCustomersTable({ customers }: RfmCustomersTableProps) {
  // Prepara os dados para a IA
  const dataContext = `Esta é a minha tabela de segmentação de clientes (RFM) para o período selecionado. Analise os padrões de Recência (last_purchase_date), Frequência (frequency) e Valor (monetary_value).`;

  // Prepara o JSON para a IA de forma mais legível
  const dataJson = JSON.stringify(
    customers.map((c) => ({
      cliente: c.customer_name,
      ultimaCompra: c.last_purchase_date,
      frequencia: c.frequency,
      valorMonetario: c.monetary_value,
    }))
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Segmentação de Clientes (RFM)</CardTitle>
          <CardDescription>
            Recência, Frequência e Valor dos clientes no período.
          </CardDescription>
        </div>
        <ExplainDataButton dataContext={dataContext} dataJson={dataJson} />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Última Compra (Recência)</TableHead>
              <TableHead className="text-right">Frequência (Pedidos)</TableHead>
              <TableHead className="text-right">Valor Total (R$)</TableHead>
              <TableHead className="text-right">Segmento (Tag)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  Nenhum cliente encontrado no período.
                </TableCell>
              </TableRow>
            )}
            {customers.map((customer) => (
              <TableRow key={customer.customer_id}>
                <TableCell className="font-medium">
                  {customer.customer_name || 'Cliente não identificado'}
                </TableCell>
                <TableCell>
                  {formatDate(customer.last_purchase_date)}
                </TableCell>
                <TableCell className="text-right">
                  {customer.frequency}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(customer.monetary_value)}
                </TableCell>
                <TableCell className="text-right">
                  {/* Lógica de Segmentação simples (exemplo) */}
                  {customer.frequency > 10 && customer.monetary_value > 500 ? (
                    <Badge variant="default" className="bg-green-600">
                      Campeão
                    </Badge>
                  ) : customer.frequency > 5 ? (
                    <Badge variant="secondary">Fiel</Badge>
                  ) : (
                    <Badge variant="outline">Ocasional</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

