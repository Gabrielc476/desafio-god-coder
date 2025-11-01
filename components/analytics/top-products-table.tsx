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
import { TopProduct } from '@/lib/types'; // Importa o tipo correto
import { Badge } from '@/components/ui/badge';
import { ExplainDataButton } from './explain-data-button';

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
  // Prepara os dados para a IA usando o contrato snake_case da API
  const dataContext = `Estes são os meus 5 produtos mais vendidos no período selecionado, ordenados por receita.`;
  const dataJson = JSON.stringify(
    products.map((p) => ({
      // CORREÇÃO: Usando snake_case, conforme lib/types.ts
      nome: p.product_name,
      receita: p.total_revenue,
      pedidos: p.total_orders,
      percentualReceita: `${p.revenue_percentage.toFixed(1)}%`,
    }))
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Top 5 Produtos</CardTitle>
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
                {/* CORREÇÃO: colSpan 4 */}
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Nenhum produto encontrado no período.
                </TableCell>
              </TableRow>
            )}
            {products.map((product) => (
              // CORREÇÃO: Usando snake_case de lib/types.ts
              <TableRow key={product.product_id}>
                <TableCell className="font-medium">
                  {product.product_name}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(product.total_revenue)}
                </TableCell>
                <TableCell className="text-right">
                  {product.total_orders}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">
                    {product.revenue_percentage.toFixed(1)}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

