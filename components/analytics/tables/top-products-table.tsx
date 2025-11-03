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
import { TopProduct } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { ExplainDataButton } from '../explain-data-button';
import { Skeleton } from '@/components/ui/skeleton';

interface TopProductsTableProps {
  products: TopProduct[];
}

// Helper para formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export function TopProductsTable({ products }: TopProductsTableProps) {
  // CORREÇÃO (TypeError: ...toFixed):
  // Calculamos o total da receita AQUI para encontrar a porcentagem
  const totalRevenueAllProducts = products.reduce(
    (acc, p) => acc + p.totalRevenue,
    0
  );

  // Prepara os dados para a IA
  const dataContext = `Estes são os meus produtos mais vendidos no período selecionado, ordenados por receita.`;
  const dataJson = JSON.stringify(
    products.map((p) => {
      // CORREÇÃO: Calculamos o % aqui
      const revenuePercentage =
        totalRevenueAllProducts > 0
          ? (p.totalRevenue / totalRevenueAllProducts) * 100
          : 0;

      return {
        // CORREÇÃO: Ajustando para camelCase (baseado nos logs [API Success])
        nome: p.name,
        receita: p.totalRevenue,
        pedidos: p.totalSold,
        percentualReceita: `${revenuePercentage.toFixed(1)}%`,
      };
    })
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Top Produtos</CardTitle>
          <CardDescription>
            Os produtos que mais geraram receita no período.
          </CardDescription>
        </div>
        <ExplainDataButton
          dataContext={dataContext}
          dataJson={dataJson}
          
        />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead className="text-right">Receita Total</TableHead>
              <TableHead className="text-right">Pedidos</TableHead>
              <TableHead className="text-right">% da Receita</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-4 text-center text-muted-foreground"
                >
                  Nenhum produto encontrado no período.
                </TableCell>
              </TableRow>
            )}
            {products.map((product) => {
              // CORREÇÃO: Calculamos o % aqui TAMBÉM para exibição
              const revenuePercentage =
                totalRevenueAllProducts > 0
                  ? (product.totalRevenue / totalRevenueAllProducts) * 100
                  : 0;

              return (
                // CORREÇÃO: Ajustando para camelCase (baseado nos logs [API Success])
                <TableRow key={product.productId}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(product.totalRevenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    {product.totalSold}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">
                      {revenuePercentage.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Componente de Skeleton para a tabela
export function TopProductsTableLoader() {
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
  );
}

