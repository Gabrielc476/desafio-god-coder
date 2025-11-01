'use client'; // Este componente usa Recharts e 'use client'

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SalesByChannel } from '@/lib/types';
import { ExplainDataButton } from './explain-data-button';

interface SalesByChannelChartProps {
  data: SalesByChannel[];
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

export function SalesByChannelChart({ data }: SalesByChannelChartProps) {
  // Prepara os dados para a IA
  const dataContext = `Esta é a minha receita total por canal de venda no período selecionado.`;
  const dataJson = JSON.stringify(
    data.map((item) => ({
      canal: item.channel_name,
      receita: item.total_revenue,
      pedidos: item.total_sales,
    }))
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Receita por Canal</CardTitle>
          <CardDescription>
            Receita total gerada por cada canal de venda.
          </CardDescription>
        </div>
        <ExplainDataButton
          dataContext={dataContext}
          dataJson={dataJson}
        />
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">
              Nenhum dado de canal encontrado no período.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
              <XAxis
                dataKey="channel_name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `R$${value / 1000}k`}
              />
              <Tooltip
                formatter={(value: number) => [
                  formatCurrency(value),
                  'Receita',
                ]}
                cursor={{ fill: 'hsl(var(--muted))' }}
              />
              <Bar
                dataKey="total_revenue"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

