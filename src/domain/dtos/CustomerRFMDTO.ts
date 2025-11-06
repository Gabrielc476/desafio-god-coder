/**
 * DTO para o caso de uso "Análise de Clientes (RFM)".
 */
export type CustomerRFMDTO = {
  customerId: number;
  customerName: string;
  lastPurchaseDate: Date;
  frequency: number;
  monetaryValue: number;
};