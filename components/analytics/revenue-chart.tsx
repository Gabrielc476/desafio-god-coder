'use client'; // Gráficos são interativos, precisam ser 'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RevenueDataPoint } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
// import { AIExplainButton } from './ai-explain-button'; // Importaremos no próximo passo

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const dataContext = "Estes são os dados de faturamento ao longo do tempo para o período selecionado.";

  // Formata os dados para o gráfico
  const chartData = data.map(item => ({
    ...item,
    // Formata a data para exibição no eixo X
    date: formatDate(item.date),
    // O recharts espera um número para o eixo Y
    totalRevenue: Number(item.total_revenue) 
  }));

  return (
    <Card>
       <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Receita no Período</CardTitle>
          <CardDescription>
            Receita diária total no período selecionado.
          </CardDescription>
        </div>
        {/* // PASSO FUTURO: Adicionar o botão de IA aqui
          <AIExplainButton data={data} dataContext={dataContext} /> 
        */}
      </CardHeader>
      <CardContent className="h-[300px] w-full">
        {chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >
              <XAxis
                dataKey="date"
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
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                labelFormatter={(label) => `Data: ${label}`}
                formatter={(value: number) => [formatCurrency(value), "Receita"]}
              />
              <Line
                type="monotone"
                dataKey="totalRevenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
           <div className="flex h-full w-full items-center justify-center text-muted-foreground">
             Nenhum dado encontrado para o período.
           </div>
        )}
      </CardContent>
    </Card>
  );
}

