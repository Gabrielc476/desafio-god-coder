/**
 * DTO para o caso de uso "Vendas por Tipo de Pagamento".
 */
export type SalesByPaymentTypeDTO = {
  paymentTypeId: number;
  paymentTypeName: string;
  totalRevenue: number;
  totalTransactions: number;
};