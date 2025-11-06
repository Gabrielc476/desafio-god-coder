/**
 * DTO para o caso de uso "Heatmap de Vendas".
 */
export type SalesHeatmapDTO = {
  hour: number;
  channelId: number;
  channelName: string;
  totalSales: number;
  totalRevenue: number;
};