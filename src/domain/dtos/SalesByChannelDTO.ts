/**
 * DTO para o caso de uso "Vendas por Canal".
 */
export type SalesByChannelDTO = {
  channelId: number;
  channelName: string;
  totalSales: number;
  totalRevenue: number;
};