'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SalesByPaymentType } from '@/lib/types';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  PieLabelRenderProps,
} from 'recharts';
import { ExplainDataButton } from './explain-data-button';
import { Badge } from '@/components/ui/badge';

// Cores para o gráfico de pizza (baseado no shadcn)
const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--muted))',
  'hsl(var(--accent))',
  'hsl(var(--info))',
  'hsl(var(--success))',
];

// Helper para formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// CORREÇÃO 1: Adicionar um type-guard para 'percent'
const renderCustomizedLabel = (props: PieLabelRenderProps) => {
  const { percent } = props;

  // Checa se 'percent' é um número válido (não null/undefined)
  // antes de usá-lo em operações matemáticas.
  if (typeof percent !== 'number' || percent === 0) {
    return '0%';
  }

  // Agora o TypeScript sabe que 'percent' é um 'number'
  return `${(percent * 100).toFixed(0)}%`;
};

interface SalesByPaymentChartProps {
  data: SalesByPaymentType[];
}

export function SalesByPaymentChart({ data }: SalesByPaymentChartProps) {
  // Prepara os dados para a IA
  const dataContext = `Esta é a distribuição da minha receita total por tipo de pagamento no período selecionado.`;
  const dataJson = JSON.stringify(
    data.map((item) => ({
      tipo: item.payment_type_name,
      receita: item.total_revenue,
      transacoes: item.total_transactions,
    }))
  );

  // CORREÇÃO 2: Variável 'totalRevenue' removida pois não estava sendo usada.
  // O 'renderCustomizedLabel' usa o 'percent' fornecido pela recharts.

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Receita por Pagamento</CardTitle>
          <CardDescription>
            Como sua receita está distribuída entre os tipos de pagamento.
            {/* CORREÇÃO: Removido o 'd' extra no fechamento da tag */}
          </CardDescription>
        </div>
        <ExplainDataButton dataContext={dataContext} dataJson={dataJson} />
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
            Nenhum dado de pagamento encontrado no período.
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'Receita') {
                      return [formatCurrency(value), name];
                    }
                    return [value, name];
                  }}
                />
                <Legend />
                <Pie
                  data={data}
                  dataKey="total_revenue"
                  nameKey="payment_type_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="flex flex-wrap gap-2 pt-4">
          {data.map((item, index) => (
            <div
              key={item.payment_type_id}
              className="flex items-center gap-2"
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm font-medium">
                {item.payment_type_name}:
              </span>
              <Badge variant="secondary">
                {formatCurrency(item.total_revenue)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

