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
import { SalesHeatmapPoint } from '@/lib/types';
import { ExplainDataButton } from './explain-data-button';

interface SalesHeatmapTableProps {
  data: SalesHeatmapPoint[];
}

// Helper para formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function SalesHeatmapTable({ data }: SalesHeatmapTableProps) {
  // Prepara os dados para a IA
  const dataContext = `Este é um mapa de calor que mostra o total de receita por hora do dia, agrupado por canal de venda.`;
  const dataJson = JSON.stringify(
    data.map((item) => ({
      hora: `${item.hour}:00`,
      canal: item.channel_name,
      receita: item.total_revenue,
      pedidos: item.total_sales,
    }))
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Mapa de Calor</CardTitle>
          <CardDescription>
            Receita por hora e canal de venda.
          </CardDescription>
        </div>
        <ExplainDataButton
          dataContext={dataContext}
          dataJson={dataJson}
        />
      </CardHeader>
      <CardContent className="max-h-[380px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hora</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead className="text-right">Receita</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground"
                >
                  Nenhum dado encontrado no período.
                </TableCell>
              </TableRow>
            )}
            {data.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.hour}:00</TableCell>
                <TableCell>{item.channel_name}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.total_revenue)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

