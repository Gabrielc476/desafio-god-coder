/**
 * DTO para o caso de uso "Top Produtos".
 */
export type TopProductDTO = {
  productId: number;
  name: string;
  totalSold: number;
  totalRevenue: number;
};